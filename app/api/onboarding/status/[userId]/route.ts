import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { onboarding } from '@/db/schema/onboarding';
import { eq } from 'drizzle-orm';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
) {
    try {
        const { userId } = await params;
        console.log('GET request:', {
            url: request.url,
            params,
            headers: Object.fromEntries(request.headers)
        });

        const userIdNum = parseInt(userId);
        
        const onboardingStatus = await db
            .select()
            .from(onboarding)
            .where(eq(onboarding.user_id, userIdNum))
            .limit(1);

        if (!onboardingStatus || onboardingStatus.length === 0) {
            return NextResponse.json(
                { error: 'Onboarding not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(onboardingStatus[0]);
    } catch (error) {
        console.error('Error fetching onboarding status:', error);
        return NextResponse.json(
            { error: 'Failed to fetch onboarding status' },
            { status: 500 }
        );
    }
}