import { NextRequest, NextResponse } from 'next/server';

export async function checkSession(request: NextRequest) {
    // Get the user token from the cookies
    const token = request.cookies.get('token')?.value;

    if (!token) {
        return NextResponse.json(
            { error: 'Unauthorized. Please log in.' },
            { status: 401 }
        );
    }

    // You can add more validation here (e.g., verify JWT, check user in database)
    try {
        // Verify token, fetch user, etc.
        return NextResponse.next();
    } catch (error) {
        console.error('Session validation error:', error);
        return NextResponse.json(
            { error: 'Invalid session. Please log in again.' },
            { status: 401 }
        );
    }
} 