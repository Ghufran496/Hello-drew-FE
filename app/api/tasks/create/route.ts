import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { tasks } from '@/db/schema/tasks';

export async function POST(request: NextRequest) {
    try {
        const { userId, title, description, priority, dueDate } = await request.json();

        if (!userId || !title || !priority) {
            return NextResponse.json(
                { error: 'Missing required fields: userId, title, or priority' },
                { status: 400 }
            );
        }

        const [newTask] = await db.insert(tasks).values({
            userId: parseInt(userId),
            title,
            description,
            priority,
            dueDate: dueDate ? new Date(dueDate) : null,
            status: 'pending'
        }).returning();

        return NextResponse.json(
            { message: 'Task created successfully', task: newTask },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error creating task:', error);
        return NextResponse.json(
            { error: 'Failed to create task' },
            { status: 500 }
        );
    }
}