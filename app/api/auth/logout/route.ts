import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        // Log the request URL for debugging purposes
        const url = request.url;
        console.log('Logout request from:', url);

        // The token should be cleared on the client side
        return NextResponse.json(
            { message: 'Logout successful.' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Logout error:', error);
        return NextResponse.json(
            { error: 'An error occurred during logout.' },
            { status: 500 }
        );
    }
}