import { NextResponse } from 'next/server';
import { db } from '@/db';
import { integrations } from '@/db/schema/integrations';
import { leads } from '@/db/schema/leads';

async function fetchHubSpotLeads(accessToken: string) {
  try {
    const response = await fetch(
      'https://api.hubapi.com/crm/v3/objects/contacts',
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch HubSpot leads');
    }

    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('Error fetching HubSpot leads:', error);
    throw error;
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state'); // This is our userId
    const returnTo = searchParams.get('returnTo');

    if (!code || !state) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/welcome/connect-systems?error=missing_params`);
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://api.hubapi.com/oauth/v1/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: process.env.HUBSPOT_CLIENT_ID!,
        client_secret: process.env.HUBSPOT_CLIENT_SECRET!,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/onboarding/hubspot/callback`,
        code: code,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error('HubSpot token error:', tokenData);
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/welcome/connect-systems?error=token_error`);
    }

    // Save the integration
    await db.insert(integrations).values({
      userId: parseInt(state),
      platformName: 'hubspot',
      credentials: {
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_in: tokenData.expires_in,
        created_at: new Date().toISOString(),
      },
    });

    // Fetch leads from HubSpot
    const hubspotLeads = await fetchHubSpotLeads(tokenData.access_token);

    // Save leads to database according to schema
    for (const lead of hubspotLeads) {
      await db.insert(leads).values({
        user_id: parseInt(state),
        external_id: lead.id,
        source: 'hubspot',
        name: `${lead.properties.firstname || ''} ${lead.properties.lastname || ''}`.trim(),
        email: lead.properties.email,
        phone: lead.properties.phone || null,
        status: 'new',
        drip_campaign: null,
        drip_campaign_status: null,
        lead_details: {
          raw_hubspot_data: lead,
          hubspot_object_id: lead.properties.hs_object_id,
          created_at: lead.createdAt,
          updated_at: lead.updatedAt,
          archived: lead.archived
        },
        created_at: new Date(lead.properties.createdate),
        updated_at: new Date(lead.properties.lastmodifieddate)
      })
    }

    // Redirect based on where the connection was initiated
    if (returnTo === 'settings') {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/integrate?integration=hubspot&status=success`);
    }
    
    // Default redirect for onboarding flow
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/welcome/connect-systems?success=hubspot_connected`);

  } catch (error) {
    console.error('Error in HubSpot callback:', error);
    const url = new URL(request.url);
    const returnTo = url.searchParams.get('returnTo');
    
    if (returnTo === 'settings') {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/integrate?integration=hubspot&status=error`);
    }
    
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/welcome/connect-systems?error=callback_error`);
  }
}