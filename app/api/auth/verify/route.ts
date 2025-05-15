import { jwtVerify } from 'jose';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema/users';
import { eq } from 'drizzle-orm';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    try {
        if (!token) {
            throw new Error('Verification token is missing.');
        }

        const { payload } = await jwtVerify(
            token,
            new TextEncoder().encode(process.env.JWT_SECRET)
        );

        await db.update(users)
            .set({ is_verified: true })
            .where(eq(users.id, payload.userId as number));

        return NextResponse.json(
            { message: 'Email verified successfully.' },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to verify email' },
            { status: 400 }
        );
    }
}