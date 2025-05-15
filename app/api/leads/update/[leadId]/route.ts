import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { leads } from '@/db/schema/leads';
import { eq } from 'drizzle-orm';
import axios from 'axios';

interface UpdatePayload {
    apiKey?: string;
    source?: string;
    stage?: string;
    company?: string;
    [key: string]: string | undefined;
}

interface LeadDetails {
    stage?: string;
    company?: string;
    [key: string]: string | undefined;
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ leadId: string }> }
) {
    try {
        const { leadId } = await params;
        const leadIdNum = parseInt(leadId);
        const updates = await request.json();
        const { apiKey, source, stage, company } = updates;

        // Remove fields that need special handling
        delete updates.id;
        delete updates.apiKey;
        delete updates.source;
        delete updates.stage;
        delete updates.company;

        // Prepare the update data
        const updateData: UpdatePayload = { ...updates };

        // Only add fields that are actually being updated
        if (source) {
            updateData.source = source;
        }

        if (stage || company) {
            const currentLead = await db
                .select()
                .from(leads)
                .where(eq(leads.id, leadIdNum))
                .limit(1)
                .then(rows => rows[0]);

            updateData.lead_details = {
                ...(currentLead.lead_details as LeadDetails),
                ...(stage && { stage }),
                ...(company && { company })
            };
        }

        // Only proceed with update if there's data to update
        if (Object.keys(updateData).length === 0) {
            return NextResponse.json(
                { error: 'No valid update data provided' },
                { status: 400 }
            );
        }

        const updatedLead = await db
            .update(leads)
            .set(updateData)
            .where(eq(leads.id, leadIdNum))
            .returning();

        // Handle external API updates if needed
        if (apiKey && source) {
            try {
                const options = {
                    method: 'PUT',
                    url: `https://api.followupboss.com/v1/people/${updatedLead[0].external_id}`,
                    params: { mergeTags: 'false' },
                    headers: {
                        accept: 'application/json',
                        'content-type': 'application/json',
                        'Authorization': `Basic ${Buffer.from(apiKey + ':').toString('base64')}`
                    },
                    data: updateData
                };

                await axios.request(options);
            } catch (error) {
                console.error('Error syncing with external service:', error);
            }
        }

        return NextResponse.json({
            message: 'Lead updated successfully',
            lead: updatedLead[0]
        });
    } catch (error) {
        console.error('Error updating lead:', error);
        return NextResponse.json(
            { error: 'Failed to update lead' },
            { status: 500 }
        );
    }
}
