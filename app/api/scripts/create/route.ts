import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { scripts } from '@/db/schema/scripts';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { userId, type, title, content } = body;

        if (!userId || !type || !title || !content) {
            return NextResponse.json(
                { error: 'Missing required fields: userId, type, title, or content' },
                { status: 400 }
            );
        }

        const [newScript] = await db.insert(scripts).values({
            userId: parseInt(userId),
            type,
            title,
            content
        }).returning();

        return NextResponse.json(
            { message: 'Script created successfully', script: newScript },
            { status: 201 }
        );

    } catch (error) {
        console.error('Error creating script:', error);
        return NextResponse.json(
            { error: 'Failed to create script' },
            { status: 500 }
        );
    }
}