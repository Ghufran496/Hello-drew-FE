import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { usageLogs } from '@/db/schema/usage_logs';
import { eq, count } from 'drizzle-orm';

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

        // Fetch aggregated usage data
        const usageSummary = await db
            .select({
                type: usageLogs.type,
                count: count()
            })
            .from(usageLogs)
            .where(eq(usageLogs.userId, parseInt(userId)))
            .groupBy(usageLogs.type)
            .execute();

        return NextResponse.json({ usageSummary });
    } catch (error) {
        console.error('Error fetching usage analytics:', error);
        return NextResponse.json(
            { error: 'Failed to fetch usage analytics' },
            { status: 500 }
        );
    }
}