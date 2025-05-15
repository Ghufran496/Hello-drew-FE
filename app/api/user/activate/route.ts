import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema/users';
import { packages } from '@/db/schema/packages';
import { usageLimits } from '@/db/schema/usage_limits';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
    try {
        const { userId, packageId } = await req.json();

        if (!userId || !packageId) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Activate user
        await db
            .update(users)
            .set({ is_active: true, package_id: packageId })
            .where(eq(users.id, userId));

        // Fetch package limits
        const packageLimit = await db
            .select({
                calls_limit: packages.calls_limit,
                texts_limit: packages.texts_limit,
                emails_limit: packages.emails_limit,
            })
            .from(packages)
            .where(eq(packages.id, packageId))
            .limit(1);

        if (!packageLimit[0]) {
            return NextResponse.json(
                { error: 'Package not found' },
                { status: 404 }
            );
        }

        // Assign usage limits
        await db.insert(usageLimits).values({
            userId: userId,
            callsLimit: packageLimit[0].calls_limit,
            textsLimit: packageLimit[0].texts_limit,
            emailsLimit: packageLimit[0].emails_limit,
        });

        return NextResponse.json(
            { message: 'User activated and package assigned successfully' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error activating user:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}