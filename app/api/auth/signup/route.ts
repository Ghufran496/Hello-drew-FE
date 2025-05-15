import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema/users';
import { eq, and, not} from 'drizzle-orm';
import { generateVerificationToken } from '@/utility/tokenUtils';
import { sendVerificationEmail } from '@/app/services/mailgun';

export async function POST(request: NextRequest) {
    try {
        const { id, email } = await request.json();

        // Validate input
        if (!id || !email) {
            return NextResponse.json(
                { error: 'Name, email, and password are required.' },
                { status: 400 }
            );
        }

        // Check if email exists for a different user
        const conflictingUser = await db
            .select()
            .from(users)
            .where(and(eq(users.email, email), not(eq(users.id, id))))
            .limit(1)
            .then(rows => rows[0]);

        if (conflictingUser) {
            return NextResponse.json(
                { error: 'Email is already associated with another account.' },
                { status: 409 }
            );
        }

        // Update the user's email
        await db
            .update(users)
            .set({ email })
            .where(eq(users.id, id));

        // Generate verification token and send email
        const token = await generateVerificationToken(id);
        await sendVerificationEmail(email, token);

        return NextResponse.json(
            { 
                message: 'Please check your email to verify your account.',
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Signup error:', error);
        return NextResponse.json(
            { error: 'Failed to send verification email.' },
            { status: 500 }
        );
    }
}