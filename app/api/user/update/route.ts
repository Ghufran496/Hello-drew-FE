import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema/users';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';

export async function POST(request: NextRequest) {
    try {
        const { userId, updateData } = await request.json();

        if (!userId || !updateData) {
            return NextResponse.json(
                { error: 'Missing required fields: userId or updateData' },
                { status: 400 }
            );
        }
        if (updateData.password) {
            updateData.password = await bcrypt.hash(updateData.password, 10);
        }

        const updatedUser = await db
            .update(users)
            .set(updateData)
            .where(eq(users.id, parseInt(userId)))
            .returning();

        if (!updatedUser) {
            return NextResponse.json(
                { error: 'User not found or update failed' },
                { status: 404 }
            );
        }

        return NextResponse.json({ updatedUser });
    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json(
            { error: 'Failed to update user' },
            { status: 500 }
        );
    }
}
