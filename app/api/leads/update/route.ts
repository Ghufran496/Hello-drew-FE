import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { leads } from '@/db/schema/leads';
import { eq } from 'drizzle-orm';

export async function PATCH(request: NextRequest) {
    try {
        const url = new URL(request.url);
        const leadId = parseInt(url.searchParams.get('id') || '');
        const updates = await request.json();

        // Remove any id field from updates to prevent overwriting
        delete updates.id;

        const updatedLead = await db
            .update(leads)
            .set(updates)
            .where(eq(leads.id, leadId))
            .returning();

        if (!updatedLead || updatedLead.length === 0) {
            return NextResponse.json(
                { error: 'Lead not found' },
                { status: 404 }
            );
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