import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const returnTo = searchParams.get('returnTo') || 'settings'; // Default to settings
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const clientId = process.env.FOLLOWUPBOSS_CLIENT_ID;
    const redirectUri = `https://www.app.hellodrew.ai/api/onboarding/followupboss/callback`;

    const authUrl = `https://hellodrew.followupboss.com/oauth/authorize?` + 
      `response_type=auth_code` +
      `&client_id=${clientId}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&state=${userId}` +
      `&returnTo=${returnTo}`;

    return NextResponse.json({ url: authUrl });
  } catch (error) {
    console.error('Follow Up Boss login error:', error);
    return NextResponse.json(
      { error: 'Failed to generate auth URL' },
      { status: 500 }
    );
  }
} 