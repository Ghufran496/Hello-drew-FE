import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { onboarding } from '@/db/schema/onboarding';
import { eq } from 'drizzle-orm';

export async function GET(req: NextRequest) {
    try {
        const userId = req.url.split('/').pop(); // Get userId from URL

        const result = await db.select()
            .from(onboarding)
            .where(eq(onboarding.user_id, parseInt(userId!)))
            .limit(1);

        if (!result.length) {
            return NextResponse.json(
                { error: 'Onboarding status not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ onboarding: result[0] });

    } catch (error) {
        console.error('Error fetching onboarding status:', error);
        return NextResponse.json(
            { error: 'Unable to fetch onboarding status' },
            { status: 500 }
        );
    }
}