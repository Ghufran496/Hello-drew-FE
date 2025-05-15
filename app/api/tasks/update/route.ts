import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { tasks } from '@/db/schema/tasks';
import { eq } from 'drizzle-orm';

export async function PATCH(request: NextRequest) {
    try {
        const { taskId, updates } = await request.json();

        if (!taskId || !updates) {
            return NextResponse.json(
                { error: 'Missing required fields: taskId or updates' },
                { status: 400 }
            );
        }

        const [updatedTask] = await db
            .update(tasks)
            .set({
                ...updates,
                updatedAt: new Date()
            })
            .where(eq(tasks.id, taskId))
            .returning();

        if (!updatedTask) {
            return NextResponse.json(
                { error: 'Task not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { message: 'Task updated successfully', task: updatedTask }
        );
    } catch (error) {
        console.error('Error updating task:', error);
        return NextResponse.json(
            { error: 'Failed to update task' },
            { status: 500 }
        );
    }
}