import { NextResponse } from 'next/server';
import { generateVerificationToken } from '@/utility/tokenUtils';
import { sendVerificationEmail } from '@/app/services/mailgun';

export async function GET() {
    try {
        // Generate a test token
        const token = await generateVerificationToken(1); // Assuming user ID 1

        // Send verification email
        await sendVerificationEmail('najeeb.nedo5555@gmail.com', token);

        return NextResponse.json({
            message: 'Verification email sent successfully',
            token: token // For testing purposes
        });
    } catch (error) {
        console.error('Test email error:', error);
        return NextResponse.json(
            { error: 'Failed to send test email' },
            { status: 500 }
        );
    }
} 