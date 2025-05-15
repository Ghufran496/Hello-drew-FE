import { NextResponse, NextRequest } from 'next/server';
import { GoogleCalendarService } from '@/app/services/googleCalendar';

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId');
    if (!userId) {
      throw new Error('User ID is required');
    }
    const googleCalendar = new GoogleCalendarService();
    const authUrl = await googleCalendar.getAuthUrl(userId);
    return NextResponse.json({ url: authUrl });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Failed to generate auth URL' }, { status: 500 });
  }
} 