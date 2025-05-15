import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { integrations } from '@/db/schema/integrations';
import { eq } from 'drizzle-orm';
import { GoogleCalendarService } from '@/app/services/googleCalendar';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const date = searchParams.get('date');

        if (!userId || !date) {
            return NextResponse.json(
                { error: 'Missing required parameters' },
                { status: 400 }
            );
        }

        // Get user's Google Calendar credentials
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
            token: string;
            refresh_token: string;
            expiry: string;
        };

        const calendarService = new GoogleCalendarService();
        const busySlots = await calendarService.getAvailableSlots({
            access_token: credentials.token,
            refresh_token: credentials.refresh_token,
            expiry: credentials.expiry
        }, date);

        // Generate available 30-minute slots
        const availableSlots = [];
        const startHour = 9;
        const endHour = 17;
        const slotDuration = 30;

        for (let hour = startHour; hour < endHour; hour++) {
            for (let minute = 0; minute < 60; minute += slotDuration) {
                const slotStart = new Date(date);
                slotStart.setHours(hour, minute, 0);
                
                const slotEnd = new Date(slotStart);
                slotEnd.setMinutes(slotStart.getMinutes() + slotDuration);

                const isBusy = busySlots.calendars?.primary.busy?.some(
                    busy => {
                        if (!busy.start || !busy.end) return false;
                        const busyStart = new Date(busy.start);
                        const busyEnd = new Date(busy.end);
                        return slotStart < busyEnd && slotEnd > busyStart;
                    }
                );

                if (!isBusy) {
                    availableSlots.push({
                        start: slotStart.toISOString(),
                        end: slotEnd.toISOString()
                    });
                }
            }
        }

        return NextResponse.json({ availableSlots });

    } catch (error) {
        console.error('Error fetching available slots:', error);
        return NextResponse.json(
            { error: 'Failed to fetch available slots', details: error },
            { status: 500 }
        );
    }
}

//http://localhost:3000/api/onboarding/google_calendar/available-slots?userId=18&date=2025-01-09