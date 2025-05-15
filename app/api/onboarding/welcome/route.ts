import { NextRequest, NextResponse } from 'next/server';
import { sendWelcomeEmail } from '@/app/services/welcomeEmail';

export async function POST(request: NextRequest) {
    try {
        const { user } = await request.json();

        if (!user) {
            return NextResponse.json(
                { error: 'User is required' },
                { status: 400 }
            );
        }

        await sendWelcomeEmail(user);
        
        return NextResponse.json({
            message: 'Welcome email sent successfully'
        });
    } catch (error) {
        console.error('Failed to send welcome email:', error);
        return NextResponse.json(
            { error: 'Failed to send welcome email' },
            { status: 500 }
        );
    }
} 