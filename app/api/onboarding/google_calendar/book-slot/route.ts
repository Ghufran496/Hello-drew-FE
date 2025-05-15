import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { integrations } from '@/db/schema/integrations';
import { leads } from '@/db/schema/leads';
import { appointments } from '@/db/schema/appointments';
import { eq } from 'drizzle-orm';
import { GoogleCalendarService } from '@/app/services/googleCalendar';
import { format } from 'date-fns';

export async function POST(request: NextRequest) {
    try {
        const { leadId, eventDetails } = await request.json();

        // Get lead details
        const lead = await db
            .select()
            .from(leads)
            .where(eq(leads.id, parseInt(leadId)))
            .limit(1);

        if (!lead[0]) {
            return NextResponse.json(
                { error: 'Lead not found' },
                { status: 404 }
            );
        }

        // Get user's Google Calendar credentials using lead's userId
        const integration = await db
            .select()
            .from(integrations)
            .where(eq(integrations.userId, lead[0].user_id ?? 0))
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

        const calendarService = new GoogleCalendarService();
        const event = await calendarService.bookSlot(credentials, eventDetails);
        
        // Format response
        const startTime = new Date(event.start?.dateTime ?? '');
        const endTime = new Date(event.end?.dateTime ?? '');
        
        // Store appointment in database
        const [appointment] = await db.insert(appointments).values({
            userId: lead[0].user_id ?? 0,
            appointmentTime: startTime,
            status: event.status,
            participantDetails: {
                lead: {
                    id: lead[0].id,
                    name: lead[0].name,
                    email: lead[0].email,
                    phone: lead[0].phone
                },
                duration: (endTime.getTime() - startTime.getTime()) / 1000,
                event_id: event.id,
                location: event.location,
                description: event.description,
                calendar_link: event.htmlLink
            }
        }).returning();

        const formattedResponse = {
            appointment: {
                id: appointment.id,
                lead: (appointment.participantDetails as { lead?: { id: number; name: string; email: string; phone: string } })?.lead,
                duration: (appointment.participantDetails as { duration?: number })?.duration,
                event_id: (appointment.participantDetails as { event_id?: string })?.event_id,
                location: (appointment.participantDetails as { location?: string })?.location,
                description: (appointment.participantDetails as { description?: string })?.description,
                calendar_link: (appointment.participantDetails as { calendar_link?: string })?.calendar_link,
                appointment_time: format(appointment.appointmentTime ?? new Date(), 'MM/dd/yyyy, hh:mm:ss aa'),
                status: appointment.status
            }
        };

        return NextResponse.json(formattedResponse);
    } catch (error) {
        console.error('Error booking slot:', error);
        return NextResponse.json(
            { error: 'Failed to book slot' },
            { status: 500 }
        );
    }
}

// Example request body:
// {
//     "leadId": "14",
//     "eventDetails": {
//       "summary": "Meeting with Lead",
//       "location": "brooklyn",
//       "description": "Weekly team sync",
//       "start": {
//         "dateTime": "2024-04-01T15:00:00-07:00",
//         "timeZone": "America/Los_Angeles"
//       },
//       "end": {
//         "dateTime": "2024-04-01T16:00:00-07:00",
//         "timeZone": "America/Los_Angeles"
//       },
//       "attendees": [
//         { "email": "mayowa2003ade@gmail.com" }
//       ]
//     }
// }
