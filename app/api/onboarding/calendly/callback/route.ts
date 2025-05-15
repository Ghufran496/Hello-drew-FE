import { NextRequest, NextResponse } from 'next/server';
import { CalendlyService } from '@/app/services/calendly';
import { db } from '@/db';
import { integrations } from '@/db/schema/integrations';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  if (!code) {
    return NextResponse.json({ error: 'Authorization code is required' }, { status: 400 });
  }

  if (!state) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  try {
    const clientId = process.env.CALENDLY_CLIENT_ID;
    const clientSecret = process.env.CALENDLY_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error('CALENDLY_CLIENT_ID and CALENDLY_CLIENT_SECRET environment variables are required');
    }

    const calendlyService = new CalendlyService();
    const tokens = await calendlyService.getTokens(code);
    // Check if refresh token is present
    if (!tokens.refresh_token) {
      console.warn('No refresh token received. Ensure offline access is requested.');
    }

    // Get user email from Calendly
    const userInfo = await calendlyService.getUserInfo(parseInt(state),tokens.access_token);
    if (!userInfo) {
      throw new Error('Failed to retrieve user information from Calendly');
    }
    const email = userInfo.email;

    // Calculate expiry date
    const expiryDate = tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000).toISOString() : null;

    // Store credentials in the integrations table
    await db
      .insert(integrations)
      .values({
        userId: parseInt(state),
        platformName: 'calendly',
        credentials: {
          email: email,
          token: tokens.access_token,
          expires_at: expiryDate,
          client_id: clientId,
          token_uri: 'https://auth.calendly.com/oauth/token',
          client_secret: clientSecret,
          refresh_token: tokens.refresh_token || null // Ensure refresh token is stored if available
        }
      });

    return NextResponse.redirect(new URL('/welcome/availability-settings', request.url));
  } catch (error) {
    console.error('Token exchange error:', error);
    return NextResponse.json({ error: 'Failed to exchange authorization code' }, { status: 500 });
  }
}

