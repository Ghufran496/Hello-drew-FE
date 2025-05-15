import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { integrations } from '@/db/schema/integrations';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
    try {
        const { userId } = await request.json();

        if (!userId) {
            return NextResponse.json(
                { error: 'Missing required field: userId' },
                { status: 400 }
            );
        }

        const userIntegrations = await db
            .select({
                platformName: integrations.platformName,
                credentials: integrations.credentials
            })
            .from(integrations)
            .where(eq(integrations.userId, parseInt(userId)));

        return NextResponse.json({ userIntegrations });
    } catch (error) {
        console.error('Error fetching user integrations:', error);
        return NextResponse.json(
            { error: 'Failed to fetch user integrations' },
            { status: 500 }
        );
    }
}
