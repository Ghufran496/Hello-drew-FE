import { OAuth2 } from 'jsforce';
import { NextRequest, NextResponse } from 'next/server';
import { URL } from 'url';

export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
        return NextResponse.json(
            { error: 'User ID is missing' },
            { status: 400 }
        );
    }

    const oauth2 = new OAuth2({
        clientId: process.env.SALESFORCE_CLIENT_ID,
        clientSecret: process.env.SALESFORCE_CLIENT_SECRET,
        redirectUri: `${process.env.SALESFORCE_REDIRECT_URI}?userId=${userId}`
    });

    try {
        const authUrl = oauth2.getAuthorizationUrl({
            state: userId,
            scope: 'api refresh_token',
            prompt: 'consent'
        });

        return NextResponse.redirect(authUrl);
    } catch (error) {
        console.error('Error getting authorization URL:', error);
        return NextResponse.json(
            { error: 'RemoteAccessErrorPage.apexp', error_description: 'invalid_scope: the requested scope is not allowed' },
            { status: 400 }
        );
    }
}