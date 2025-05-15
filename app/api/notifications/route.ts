import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { notifications } from '@/db/schema/notifications';
import { eq, and, inArray } from 'drizzle-orm';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
        return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    try {
        const unreadNotifications = await db
            .select()
            .from(notifications)
            .where(
                and(
                    eq(notifications.user_id, parseInt(userId)),
                    eq(notifications.is_read, false)
                )
            );

        return NextResponse.json({ notifications: unreadNotifications });
    } catch (err) {
        console.error('Error fetching unread notifications:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const { notificationIds } = await request.json();

        if (!notificationIds || !Array.isArray(notificationIds)) {
            return NextResponse.json({ error: 'Invalid notification IDs' }, { status: 400 });
        }

        await db
            .update(notifications)
            .set({ is_read: true })
            .where(inArray(notifications.id, notificationIds));

        return NextResponse.json({ message: 'Notifications marked as read' });
    } catch (err) {
        console.error('Error marking notifications as read:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}