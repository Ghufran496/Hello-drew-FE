import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { aiSuggestions } from '@/db/schema/ai_suggestions';
import { eq, desc } from 'drizzle-orm';

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

        const suggestions = await db
            .select()
            .from(aiSuggestions)
            .where(eq(aiSuggestions.userId, parseInt(userId)))
            .orderBy(desc(aiSuggestions.createdAt));

        return NextResponse.json({ suggestions });
    } catch (error) {
        console.error('Error fetching AI suggestions:', error);
        return NextResponse.json(
            { error: 'Failed to fetch AI suggestions' },
            { status: 500 }
        );
    }
}