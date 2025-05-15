import { NextResponse } from 'next/server';
import { db } from '@/db';
import { virtualMeetings } from '@/db/schema/virtual_meetings';
import { eq, gt, and } from 'drizzle-orm';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json(
                { error: 'Missing required field: userId' },
                { status: 400 }
            );
        }

        const meetings = await db
            .select()
            .from(virtualMeetings)
            .where(
                and(
                    eq(virtualMeetings.userId, parseInt(userId)),
                    gt(virtualMeetings.meetingTime, new Date())
                )
            )
            .orderBy(virtualMeetings.meetingTime);

        return NextResponse.json({ meetings });
    } catch (error) {
        console.error('Error fetching upcoming meetings:', error);
        return NextResponse.json(
            { error: 'Failed to fetch upcoming meetings' },
            { status: 500 }
        );
    }
}