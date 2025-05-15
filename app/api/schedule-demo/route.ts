import { NextResponse } from 'next/server';
import { db } from '@/db';
import { demoSchedules } from '@/db/schema/demo-schedules';
import { GoogleCalendarService } from '@/app/services/googleCalendar';
import { sendDemoConfirmationEmail } from '@/app/services/demoEmail';
import { format } from 'date-fns';

export async function POST(request: Request) {
  try {
    const { date, timeSlot, name, email, phone, companyName } = await request.json();

    if (!date || !timeSlot || !name || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create Google Calendar event with Meet link
    const googleCalendarService = new GoogleCalendarService();
    const meetingDetails = await googleCalendarService.createDemoMeeting(
      new Date(date),
      timeSlot,
      { email, name }
    );

    // Save to database
    const schedule = await db.insert(demoSchedules).values({
      scheduledDate: new Date(date),
      timeSlot,
      name,
      email,
      phone: phone || null,
      companyName,
      meetingLink: meetingDetails.meetingLink,
      eventId: meetingDetails.eventId,
      createdAt: new Date(),
    });

    // Send confirmation emails
    await sendDemoConfirmationEmail(
      { 
        name, 
        email, 
        phone,
        brokerage_name: '', // Add empty string as it's required by the type
      },
      {
        datetime: `${format(new Date(date), 'MMMM d, yyyy')} at ${timeSlot} PST`,
        meetingLink: meetingDetails.meetingLink,
        rescheduleLink: meetingDetails.rescheduleLink
      }
    );

    return NextResponse.json({
      message: 'Demo scheduled successfully',
      schedule,
      meetingDetails
    });

  } catch (error) {
    console.error('Error scheduling demo:', error);
    return NextResponse.json(
      { error: 'Failed to schedule demo' },
      { status: 500 }
    );
  }
} 