import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { tasks } from '@/db/schema/tasks';
import { eq } from 'drizzle-orm';

export async function DELETE(request: NextRequest) {
    try {
        const { taskId } = await request.json();

        if (!taskId) {
            return NextResponse.json(
                { error: 'Missing required field: taskId' },
                { status: 400 }
            );
        }

        const [deletedTask] = await db
            .delete(tasks)
            .where(eq(tasks.id, taskId))
            .returning();

        if (!deletedTask) {
            return NextResponse.json(
                { error: 'Task not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { message: 'Task deleted successfully' }
        );
    } catch (error) {
        console.error('Error deleting task:', error);
        return NextResponse.json(
            { error: 'Failed to delete task' },
            { status: 500 }
        );
    }
}