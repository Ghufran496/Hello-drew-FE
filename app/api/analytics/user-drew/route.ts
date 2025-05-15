import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { user_drew_communications } from '@/db/schema/user_drew_communications';
import { eq, desc, and } from 'drizzle-orm';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const userId = body.userId;
        const type = body.type;
        if (!userId) {
            return NextResponse.json(
                { error: 'UserId is required' },
                { status: 400 }
            );
        }

        const communicationRecords = await db
            .select()
            .from(user_drew_communications)
            .where(
                and(
                    eq(user_drew_communications.user_id, parseInt(userId)),
                    eq(user_drew_communications.type, type)
                )
            )
            .orderBy(desc(user_drew_communications.created_at))
            .execute();
        return NextResponse.json({ communicationRecords });
    } catch (error) {
        console.error('Error fetching communication records:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
