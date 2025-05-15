import { NextResponse } from 'next/server';
import { db } from '@/db';
import { virtualMeetings } from '@/db/schema/virtual_meetings';
import { eq, lte, and } from 'drizzle-orm';

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

        const summaries = await db
            .select({
                agenda: virtualMeetings.agenda,
                summary: virtualMeetings.summary,
                transcription: virtualMeetings.transcription,
                meetingTime: virtualMeetings.meetingTime
            })
            .from(virtualMeetings)
            .where(
                and(
                    eq(virtualMeetings.userId, parseInt(userId)),
                    lte(virtualMeetings.meetingTime, new Date())
                )
            )
            .orderBy(virtualMeetings.meetingTime);

        return NextResponse.json({ summaries });
    } catch (error) {
        console.error('Error fetching meeting summaries:', error);
        return NextResponse.json(
            { error: 'Failed to fetch meeting summaries' },
            { status: 500 }
        );
    }
}