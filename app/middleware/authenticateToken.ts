import { jwtVerify } from 'jose';
import { NextRequest, NextResponse } from 'next/server';

export async function authenticateToken(req: NextRequest) {
    const token = req.headers.get('authorization')?.split(' ')[1];

    if (!token) {
        return NextResponse.json(
            { error: 'Unauthorized. No token provided.' },
            { status: 401 }
        );
    }

    try {
        const { payload } = await jwtVerify(
            token,
            new TextEncoder().encode(process.env.JWT_SECRET)
        );

        // Add user info to request headers since Next.js requests are immutable
        const requestHeaders = new Headers(req.headers);
        requestHeaders.set('user', JSON.stringify(payload));
        // Create new request with modified headers
        const newRequest = new NextRequest(req.url, {
            headers: requestHeaders
        });
        return newRequest;
    } catch (err) {
        console.error('Token verification error:', err);
        return NextResponse.json(
            { error: 'Token is invalid or expired.' },
            { status: 403 }
        );
    }
}