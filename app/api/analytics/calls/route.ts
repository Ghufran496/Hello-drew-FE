import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { calls } from '@/db/schema/calls';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const userId = body.userId;

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            );
        }

        const callRecords = await db
            .select()
            .from(calls)
            .where(eq(calls.userId, parseInt(userId)))
            .execute();

        return NextResponse.json({ callRecords });
    } catch (error) {
        console.error('Error fetching calls:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
