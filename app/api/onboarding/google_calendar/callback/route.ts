import { NextRequest, NextResponse } from 'next/server';
import { GoogleCalendarService } from '@/app/services/googleCalendar';
import { db } from '@/db';
import { integrations } from '@/db/schema/integrations';
import { google } from 'googleapis';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const scopes = searchParams.get('scope')?.split(' ') || [];
  if (!code) {
    return NextResponse.json({ error: 'Authorization code is required' }, { status: 400 });
  }

  if (!state) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  try {
    const googleCalendar = new GoogleCalendarService();
    const tokens = await googleCalendar.getTokens(code);

    // Check if refresh token is present
    if (!tokens.refresh_token) {
      console.warn('No refresh token received. Ensure offline access is requested.');
    }

    // Get user email from Google
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: tokens.access_token });
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();
    const email = userInfo.data.email;
    // Convert expiry date to ISO string format
    const expiryDate = tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : null;

    // Store credentials in the integrations table
    await db
      .insert(integrations)
      .values({
        userId: parseInt(state),
        platformName: 'google_calendar',
        credentials: {
          email: email,
          token: tokens.access_token,
          expiry: expiryDate,
          scopes: scopes,
          client_id: process.env.GOOGLE_CLIENT_ID_CALENDER,
          token_uri: 'https://oauth2.googleapis.com/token',
          client_secret: process.env.GOOGLE_CLIENT_SECRET_CALENDER,
          refresh_token: tokens.refresh_token || null // Ensure refresh token is stored if available
        }
      })
      
   

    

    return NextResponse.redirect(new URL('/welcome/availability-settings', request.url));
  } catch (error) {
    console.error('Token exchange error:', error);
    return NextResponse.json({ error: 'Failed to exchange authorization code' }, { status: 500 });
  }
}