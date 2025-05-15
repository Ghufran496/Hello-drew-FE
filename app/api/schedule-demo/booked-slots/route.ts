import { NextResponse } from 'next/server';
import { db } from '@/db';
import { demoSchedules } from '@/db/schema/demo-schedules';
import { and, gte, lt } from 'drizzle-orm';
import { startOfDay, endOfDay } from 'date-fns';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get('date');

    if (!dateStr) {
      return NextResponse.json(
        { error: 'Date parameter is required' },
        { status: 400 }
      );
    }

    const date = new Date(dateStr);
    const startDate = startOfDay(date);
    const endDate = endOfDay(date);

    // Get all booked slots for the specified date
    const bookedSlots = await db
      .select()
      .from(demoSchedules)
      .where(
        and(
          gte(demoSchedules.scheduledDate, startDate),
          lt(demoSchedules.scheduledDate, endDate)
        )
      );

    return NextResponse.json({
      bookedSlots: bookedSlots.map(slot => ({
        scheduledDate: slot.scheduledDate,
        timeSlot: slot.timeSlot
      }))
    });

  } catch (error) {
    console.error('Error fetching booked slots:', error);
    return NextResponse.json(
      { error: 'Failed to fetch booked slots' },
      { status: 500 }
    );
  }
} 