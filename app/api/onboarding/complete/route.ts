import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { onboarding } from '@/db/schema/onboarding';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
    try {
        const { userId, completed } = await req.json();

        if (!userId || typeof completed !== 'boolean') {
            return NextResponse.json(
                { error: 'Missing required fields: userId or completed.' },
                { status: 400 }
            );
        }

        // Update onboarding status
        await db
            .update(onboarding)
            .set({ completed })
            .where(eq(onboarding.user_id, userId));

        return NextResponse.json(
            { message: 'Onboarding status updated successfully.' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error updating onboarding status:', error);
        return NextResponse.json(
            { error: 'Failed to update onboarding status' },
            { status: 500 }
        );
    }
}