import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { drew_lead_communications } from '@/db/schema/drew_lead_communications';
import { eq, and } from 'drizzle-orm';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const userId = body.userId;

        if (!userId) {
            return NextResponse.json(
                { error: 'UserId is required' },
                { status: 400 }
            );
        }

        const communicationRecords = await db
            .select()
            .from(drew_lead_communications)
            .where(
                and(
                    eq(drew_lead_communications.user_id, parseInt(userId)),
                    eq(drew_lead_communications.type, 'CALL'),
                    eq(drew_lead_communications.status, 'COMPLETED')
                )
            )
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
