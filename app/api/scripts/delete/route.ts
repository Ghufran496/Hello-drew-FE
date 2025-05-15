import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { scripts } from '@/db/schema/scripts';
import { eq } from 'drizzle-orm';

export async function DELETE(request: NextRequest) {
    try {
        const body = await request.json();
        const { scriptId } = body;

        if (!scriptId) {
            return NextResponse.json(
                { error: 'Missing required field: scriptId' },
                { status: 400 }
            );
        }

        const [deletedScript] = await db
            .delete(scripts)
            .where(eq(scripts.id, scriptId))
            .returning();

        if (!deletedScript) {
            return NextResponse.json(
                { error: 'Script not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { message: 'Script deleted successfully' },
            { status: 200 }
        );

    } catch (error) {
        console.error('Error deleting script:', error);
        return NextResponse.json(
            { error: 'Failed to delete script' },
            { status: 500 }
        );
    }
}