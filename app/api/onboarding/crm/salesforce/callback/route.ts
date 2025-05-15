import { OAuth2 } from 'jsforce';
import { NextRequest, NextResponse } from 'next/server';
import { URL } from 'url';

export async function GET(req: NextRequest) {

    const oauth2 = new OAuth2({
        clientId: process.env.SALESFORCE_CLIENT_ID,
        clientSecret: process.env.SALESFORCE_CLIENT_SECRET,
        redirectUri: process.env.SALESFORCE_REDIRECT_URI
    });

    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const userId = url.searchParams.get('state');

    if (!code || !userId) {
        return NextResponse.json(
            { error: 'Authorization code is missing' },
            { status: 400 }
        );
    }

    try {
        const tokenResponse = await oauth2.requestToken(code);
        const { access_token, refresh_token, instance_url, id } = tokenResponse;

        if (!id || !access_token || !refresh_token || !instance_url) {
            throw new Error('Incomplete token response');
        }
        // Save the credentials to the database or perform any other necessary actions
        await saveCredentials(Number(userId), access_token, refresh_token, instance_url);

        return NextResponse.redirect(new URL('/welcome/connect-systems', process.env.NEXT_PUBLIC_APP_URL));
    } catch (error) {
        console.error('Error during Salesforce callback:', error);
        return NextResponse.json(
            { error: 'Failed to process Salesforce callback' },
            { status: 500 }
        );
    }
}

async function saveCredentials(userId: number, accessToken: string, refreshToken: string, instanceUrl: string) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/onboarding/crm/salesforce/save-credentials`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: userId,
                accessToken: accessToken,
                refreshToken: refreshToken,
                instanceUrl: instanceUrl
            })
        });

        if (response.ok) {

            const data = await response.json();
            console.log('Credentials saved successfully:', data);
           
        } else {
            console.error('Failed to save credentials:', response.statusText);
        }
    } catch (error) {
        console.error('Error saving credentials:', error);
    }
}
