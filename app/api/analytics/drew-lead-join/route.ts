import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { drew_lead_communications } from '@/db/schema/drew_lead_communications';
import { leads } from '@/db/schema/leads';
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
            .select({
                communication: drew_lead_communications,
                lead: leads
            })
            .from(drew_lead_communications)
            .leftJoin(leads, eq(drew_lead_communications.lead_id, leads.id))
            .where(
                and(
                    eq(drew_lead_communications.user_id, parseInt(userId)),
                    eq(drew_lead_communications.type, type)
                )
            )
            .orderBy(desc(drew_lead_communications.created_at))
            .execute();
        console.log(communicationRecords, "communicationRecords")
        return NextResponse.json({ communicationRecords });
    } catch (error) {
        console.error('Error fetching communication records:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
