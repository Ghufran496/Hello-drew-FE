import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { scripts } from '@/db/schema/scripts';
import { eq } from 'drizzle-orm';

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { scriptId, updates } = body;

        if (!scriptId || !updates) {
            return NextResponse.json(
                { error: 'Missing required fields: scriptId or updates' },
                { status: 400 }
            );
        }

        const [updatedScript] = await db
            .update(scripts)
            .set(updates)
            .where(eq(scripts.id, scriptId))
            .returning();

        if (!updatedScript) {
            return NextResponse.json(
                { error: 'Script not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { message: 'Script updated successfully', script: updatedScript },
            { status: 200 }
        );

    } catch (error) {
        console.error('Error updating script:', error);
        return NextResponse.json(
            { error: 'Failed to update script' },
            { status: 500 }
        );
    }
}