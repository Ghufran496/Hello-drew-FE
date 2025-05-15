import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { integrations } from '@/db/schema/integrations';
import { FollowUpBossService } from '@/app/services/followupboss';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    const returnTo = searchParams.get('returnTo') || 'settings';

    if (error) {
      throw new Error(`OAuth error: ${error}`);
    }

    if (!code || !state) {
      throw new Error('Missing code or state parameter');
    }

    const clientId = process.env.FOLLOWUPBOSS_CLIENT_ID;
    const clientSecret = process.env.FOLLOWUPBOSS_CLIENT_SECRET;
    const redirectUri = `https://www.app.hellodrew.ai/api/onboarding/followupboss/callback`;

    // Create base64 encoded auth string
    const authString = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    // Exchange code for access token
    const tokenResponse = await fetch('https://app.followupboss.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${authString}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri,
        state: state
      }).toString()
    });

    console.log('Token Response Status:', tokenResponse.status);
    const responseBody = await tokenResponse.text();
    console.log('Response Body:', responseBody);

    if (!tokenResponse.ok) {
      throw new Error(`Token exchange failed: ${tokenResponse.status} - ${responseBody}`);
    }

    const tokens = JSON.parse(responseBody);
    const userId = parseInt(state);

    // Store in database
    await db.insert(integrations).values({
      userId: userId,
      platformName: 'followupboss',
      credentials: {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: tokens.expires_in ? 
          new Date(Date.now() + tokens.expires_in * 1000).toISOString() : 
          null
      }
    });

    // Fetch and store leads
    try {
      const followUpBossService = new FollowUpBossService();
      const leadsData = await followUpBossService.fetchLeads(userId);
      
      if (leadsData.people?.length > 0) {
        // Store leads in leads table using absolute URL
        const baseUrl = new URL(request.url).origin;
        const storeLeadsResponse = await fetch(`${baseUrl}/api/leads/store`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId: userId,
            leads: leadsData.people.map((person) => ({
              user_id: userId,
              external_id: person.id.toString(),
              source: 'FollowUpBoss',
              name: person.name || '',
              email: person.emails?.[0]?.value || '',
              phone: person.phones?.[0]?.value || '',
              status: 'new',
              lead_details: person,
              created_at: person.created,
              updated_at: person.updated
            }))
          })
        });

        if (!storeLeadsResponse.ok) {
          console.error('Failed to store leads:', await storeLeadsResponse.text());
        }
      }
    } catch (error) {
      console.error('Error fetching/storing leads:', error);
      // Continue with redirect even if lead fetching fails
    }

    // Redirect based on the flow
    const redirectUrl = returnTo === 'onboarding' 
      ? '/welcome/connect-systems'
      : '/integrate';

    return NextResponse.redirect(new URL(redirectUrl, request.url));
  } catch (error) {
    console.error('Follow Up Boss callback error:', error);
    const searchParams = new URL(request.url).searchParams;
    const returnToParam = searchParams.get('returnTo') || 'settings';
    const errorRedirect = returnToParam === 'onboarding'
      ? '/welcome/connect-systems?error=integration_failed'
      : '/integrate?error=integration_failed';
    
    return NextResponse.redirect(new URL(errorRedirect, request.url));
  }
} 