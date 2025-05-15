import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { integrationStatus } from '@/db/schema/integeration_status';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json(
                { error: 'Missing required field: userId' },
                { status: 400 }
            );
        }

        const integrations = await db
            .select({
                platformName: integrationStatus.platformName,
                status: integrationStatus.status,
                lastChecked: integrationStatus.lastChecked
            })
            .from(integrationStatus)
            .where(eq(integrationStatus.userId, parseInt(userId)));

        return NextResponse.json({ integrations });
    } catch (error) {
        console.error('Error fetching integration status:', error);
        return NextResponse.json(
            { error: 'Failed to fetch integration status' },
            { status: 500 }
        );
    }
}