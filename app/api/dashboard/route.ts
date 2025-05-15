import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { onboarding } from '@/db/schema/onboarding';
import { users } from '@/db/schema/users';
import { packages } from '@/db/schema/packages';
import { notifications } from '@/db/schema/notifications';
import { usageLimits } from '@/db/schema/usage_limits';
import { tasks } from '@/db/schema/tasks';
import { eq, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json(
                { error: 'Missing required field: userId.' },
                { status: 400 }
            );
        }

        const userIdInt = parseInt(userId);

        // Fetch onboarding data
        const onboardingData = await db
            .select({
                completed: onboarding.completed,
                scheduling_preferences: onboarding.scheduling_preferences,
            })
            .from(onboarding)
            .where(eq(onboarding.user_id, userIdInt))
            .limit(1)
            .then((rows) => rows[0]);

        if (!onboardingData || !onboardingData.completed) {
            return NextResponse.json(
                { error: 'Onboarding not completed or missing.' },
                { status: 403 }
            );
        }

        // Fetch user profile
        const userData = await db
            .select({
                id: users.id,
                name: users.name,
                email: users.email,
                package_id: users.package_id,
            })
            .from(users)
            .where(eq(users.id, userIdInt))
            .limit(1)
            .then((rows) => rows[0]);

        if (!userData) {
            return NextResponse.json(
                { error: 'Failed to fetch user data.' },
                { status: 500 }
            );
        }

        // Fetch package details
        const packageData = await db
            .select()
            .from(packages)
            .where(eq(packages.id, userData.package_id!))
            .limit(1)
            .then((rows) => rows[0]);

        // Fetch notifications
        const notificationsData = await db
            .select()
            .from(notifications)
            .where(and(eq(notifications.user_id, userIdInt), eq(notifications.is_read, false)));

        // Fetch usage metrics
        const usageData = await db
            .select()
            .from(usageLimits)
            .where(eq(usageLimits.userId, userIdInt))
            .limit(1)
            .then((rows) => rows[0]);

        // Fetch tasks
        const tasksData = await db
            .select()
            .from(tasks)
            .where(and(eq(tasks.userId, userIdInt), eq(tasks.status, 'pending')));

        // Combine data for dashboard
        return NextResponse.json({
            user: userData,
            onboarding: onboardingData,
            package: packageData,
            notifications: notificationsData,
            usage: usageData,
            tasks: tasksData
        });
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}