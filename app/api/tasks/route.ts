import { NextResponse } from 'next/server';
import { db } from '@/db';
import { tasks } from '@/db/schema/tasks';
import { eq, and } from 'drizzle-orm';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const status = searchParams.get('status') || 'pending';

        if (!userId) {
            return NextResponse.json(
                { error: 'Missing required field: userId' },
                { status: 400 }
            );
        }

        const userTasks = await db
            .select()
            .from(tasks)
            .where(
                and(
                    eq(tasks.userId, parseInt(userId)),
                    eq(tasks.status, status)
                )
            )
            .orderBy(tasks.dueDate);

        return NextResponse.json({ tasks: userTasks });
    } catch (error) {
        console.error('Error fetching tasks:', error);
        return NextResponse.json(
            { error: 'Failed to fetch tasks' },
            { status: 500 }
        );
    }
}