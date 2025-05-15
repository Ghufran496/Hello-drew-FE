import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { scripts } from '@/db/schema/scripts';
import { eq, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const type = searchParams.get('type');

        if (!userId) {
            return NextResponse.json(
                { error: 'Missing required field: userId' },
                { status: 400 }
            );
        }

        const conditions = [eq(scripts.userId, parseInt(userId))];
        if (type) {
            conditions.push(eq(scripts.type, type));
        }

        const userScripts = await db
            .select()
            .from(scripts)
            .where(and(...conditions));

        return NextResponse.json({ scripts: userScripts });

    } catch (error) {
        console.error('Error fetching scripts:', error);
        return NextResponse.json(
            { error: 'Failed to fetch scripts' },
            { status: 500 }
        );
    }
}