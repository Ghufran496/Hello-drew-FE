import { NextRequest, NextResponse } from 'next/server';
import { fetchLeadsFromCRM } from '@/app/services/crm';
import { db } from '@/db';
import { leads } from '@/db/schema/leads';
import { eq, and } from 'drizzle-orm';

export async function POST(request: NextRequest) {
    try {
        const { userId, source, apiKey } = await request.json();

        // Fetch leads from the CRM
        const crmLeads = await fetchLeadsFromCRM(source as 'FollowUpBoss', apiKey);

        // Format leads for database insertion
        const formattedLeads = crmLeads.map(lead => ({
            user_id: userId,
            external_id: lead.external_id,
            source,
            name: lead.name,
            email: lead.email,
            phone: lead.phone,
            status: lead.status
        }));

        // Filter out leads that already exist in the database
        const existingLeads = await db.select()
            .from(leads)
            .where(
                and(
                    eq(leads.user_id, userId),
                    eq(leads.source, source)
                )
            );

        // Create sets of existing external IDs and phone numbers
        const existingExternalIds = new Set(existingLeads.map(lead => lead.external_id));
        const existingPhoneNumbers = new Set(existingLeads.map(lead => lead.phone));

        // Filter out leads that have either matching external ID or phone number
        const newLeads = formattedLeads.filter(lead => 
            !existingExternalIds.has(lead.external_id) && 
            !existingPhoneNumbers.has(lead.phone)
        );

        // Insert only new leads into database
        if (newLeads.length > 0) {
            await db.insert(leads).values(newLeads);
        }

        return NextResponse.json({ 
            message: 'Leads synced successfully', 
            leads: crmLeads,
            newLeadsCount: newLeads.length
        });

    } catch (err) {
        const error = err as Error;
        return NextResponse.json(
            { error: 'Failed to sync leads', details: error.message },
            { status: 500 }
        );
    }
}