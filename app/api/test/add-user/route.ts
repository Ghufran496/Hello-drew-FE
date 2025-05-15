import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema/users';
import bcrypt from 'bcrypt';

export async function GET() {
    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash('password123', 10);

        // Add a test user
        const newUser = await db.insert(users).values({
            name: 'Drew Test',
            email: 'drew@test.com',
            password: hashedPassword,
            phone: '+1234567890',
            role: 'user',
            is_active: true
        }).returning();

        // Verify the insertion
        if (!newUser || newUser.length === 0) {
            throw new Error('Failed to create user');
        }

        return NextResponse.json({
            message: 'Test user added successfully',
            user: {
                id: newUser[0].id,
                name: newUser[0].name,
                email: newUser[0].email
            }
        });
    } catch (error) {
        console.error('Error adding test user:', error);
        return NextResponse.json(
            { error: 'Failed to add test user' },
            { status: 500 }
        );
    }
} 