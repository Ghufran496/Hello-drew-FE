import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { usageLimits } from '@/db/schema/usage_limits';
import { eq } from 'drizzle-orm';
import { notifications } from '@/db/schema/notifications';

export async function PATCH(request: NextRequest) {
    try {
        const { userId, type, increment } = await request.json();

        if (!userId || !type || typeof increment !== 'number') {
            return NextResponse.json(
                { error: 'Missing required fields: userId, type, or increment.' },
                { status: 400 }
            );
        }

        const column = type === 'call' ? 'callsUsed' : type === 'text' ? 'textsUsed' : 'emailsUsed';
        const limitColumn = type === 'call' ? 'callsLimit' : type === 'text' ? 'textsLimit' : 'emailsLimit';

        const usage = await db
            .select()
            .from(usageLimits)
            .where(eq(usageLimits.userId, userId))
            .execute();

        if (!usage.length) {
            return NextResponse.json(
                { error: 'Usage limits not found for user.' },
                { status: 404 }
            );
        }

        const currentUsage = usage[0][column] ?? 0;
        const limit = usage[0][limitColumn] ?? 0;

        if (currentUsage + increment > limit) {
            // Create notification for user
            await db.insert(notifications).values({
                user_id: userId,
                title: 'Usage Limit Warning',
                message: `You have reached your ${type} usage limit.`,
                type: 'usage'
            });

            return NextResponse.json(
                { error: `${type} usage limit exceeded` },
                { status: 400 }
            );
        }

        await db
            .update(usageLimits)
            .set({ [column]: (currentUsage + increment) })
            .where(eq(usageLimits.userId, userId));

        return NextResponse.json({ message: 'Usage updated successfully.' });
    } catch (error) {
        console.error('Error updating usage:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}