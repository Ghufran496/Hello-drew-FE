import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { onboarding } from '@/db/schema/onboarding';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
    try {
        const { userId, step, crmCredentials, schedulingPreferences, communicationTone } = await req.json();

        const updateData = {
            current_step: step,
            crm_credentials: crmCredentials || null,
            scheduling_preferences: schedulingPreferences || null,
            communication_tone: communicationTone || null,
            completed: step >= 3,
        };

        await db.update(onboarding)
            .set(updateData)
            .where(eq(onboarding.user_id, userId));

        return NextResponse.json(
            { message: 'Onboarding updated successfully' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error updating onboarding:', error);
        return NextResponse.json(
            { error: 'Invalid request' },
            { status: 400 }
        );
    }
}