import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { usageLimits } from '@/db/schema/usage_limits';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    try {
        if (!userId) {
            return NextResponse.json(
                { error: 'Missing required field: userId.' },
                { status: 400 }
            );
        }

        const usage = await db
            .select({
                callsLimit: usageLimits.callsLimit,
                callsUsed: usageLimits.callsUsed,
                textsLimit: usageLimits.textsLimit,
                textsUsed: usageLimits.textsUsed,
                emailsLimit: usageLimits.emailsLimit,
                emailsUsed: usageLimits.emailsUsed
            })
            .from(usageLimits)
            .where(eq(usageLimits.userId, parseInt(userId)))
            .execute();

        if (!usage.length) {
            return NextResponse.json(
                { error: 'Usage data not found.' },
                { status: 404 }
            );
        }

        return NextResponse.json({ usage: usage[0] });
    } catch (error) {
        console.error('Error fetching usage:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}