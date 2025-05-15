import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { leads } from '@/db/schema/leads';

interface LeadInput {
    user_id: number;
    external_id: string;
    source: string;
    name: string;
    email: string;
    phone: string;
    status: string;
    lead_details: Record<string, unknown>;
    created_at: string;
    updated_at: string;
}

interface RequestBody {
    userId: number;
    leads: LeadInput[];
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json() as RequestBody;
        const { userId, leads: leadsData } = body;

        if (!userId || !leadsData) {
            return NextResponse.json(
                { error: 'User ID and leads data are required' },
                { status: 400 }
            );
        }

        // Map leads data to match schema
        const formattedLeads = leadsData.map((lead: LeadInput) => ({
            user_id: lead.user_id,
            external_id: lead.external_id,
            source: lead.source,
            name: lead.name,
            email: lead.email,
            phone: lead.phone,
            status: lead.status,
            lead_details: lead.lead_details,
            created_at: new Date(lead.created_at),
            updated_at: new Date(lead.updated_at)
        }));

        // Insert leads into database
        const insertedLeads = await db.insert(leads).values(formattedLeads).returning();

        return NextResponse.json({
            message: 'Leads stored successfully',
            leads: insertedLeads
        });

    } catch (error) {
        console.error('Error storing leads:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
