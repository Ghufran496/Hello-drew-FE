import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { integrations } from '@/db/schema/integrations';
import { eq, and } from 'drizzle-orm';

export async function POST(req: NextRequest) {
    try {
        const { userId, accessToken } = await req.json();

        if (!userId || !accessToken) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Validate the access token by making a request to HubSpot API
        const response = await fetch('https://api.hubapi.com/integrations/v1/me', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (!response.ok) {
            return NextResponse.json(
                { error: 'Invalid access token' },
                { status: 401 }
            );
        }

        // Fetch the email associated with the access token
        const userResponse = await fetch('https://api.hubapi.com/settings/v3/users/', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (!userResponse.ok) {
            return NextResponse.json(
                { error: 'Failed to fetch user email' },
                { status: 500 }
            );
        }

        const userData = await userResponse.json();
        const email = userData.results[0]?.email;

        if (!email) {
            return NextResponse.json(
                { error: 'Email not found' },
                { status: 404 }
            );
        }

        // Check if the integration already exists
        const existingIntegration = await db
            .select()
            .from(integrations)
            .where(
                and(
                    eq(integrations.userId, userId),
                    eq(integrations.platformName, 'hubspot')
                )
            )
            .limit(1)
            .then(rows => rows[0]);

        if (existingIntegration) {
            return NextResponse.json(
                { message: 'Integration already exists' },
                { status: 200 }
            );
        }

        // Access token is valid, save it and the email in the database
        await db
            .insert(integrations)
            .values({
                userId: userId,
                platformName: 'hubspot',
                credentials: { email: email, accessToken: accessToken  }
            });

        return NextResponse.json(
            { message: 'Credentials saved successfully' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error validating access token or saving credentials:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
