import { NextRequest, NextResponse } from 'next/server';
import { GoogleCalendarService } from '@/app/services/googleCalendar';
import { db } from '@/db';
import { integrations } from '@/db/schema/integrations';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  const googleCalendar = new GoogleCalendarService();

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Get user's Google Calendar credentials from DB
    const integration = await db
      .select()
      .from(integrations)
      .where(eq(integrations.userId, parseInt(userId)))
      .limit(1);

    if (!integration[0]?.credentials) {
      return NextResponse.json(
        { error: 'Calendar not connected' },
        { status: 404 }
      );
    }

    const credentials = integration[0].credentials as {
      access_token: string;
      refresh_token: string;
      expiry: string;
    };

    const appointments = await googleCalendar.getCalendarEvents(credentials);
    return NextResponse.json({ appointments });
  } catch (error) {
    console.error('Calendar API error:', error);
    return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 });
  }
}

//http://localhost:3000/api/onboarding/google_calendar/fetch-appointments?userId=18