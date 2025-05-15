import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { db } from '@/db';
import { integrations } from '@/db/schema/integrations';
import { eq, and } from 'drizzle-orm';
export async function POST(req: NextRequest) {
    try {
        const { userId, apiKey } = await req.json();

        if (!userId || !apiKey) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Base64 encode the API key
        const encodedApiKey = Buffer.from(apiKey).toString('base64');

        // Fetch the actual email associated with the API key
        let email;
        try {
            const options = {
                method: 'GET',
                headers: {
                    'Authorization': `Basic ${encodedApiKey}`,
                    'Accept': 'application/json'
                }
            };

            const identityResponse = await fetch('https://api.followupboss.com/v1/identity', options);
            if (!identityResponse.ok) {
                return NextResponse.json(
                    { error: 'Failed to fetch identity' },
                    { status: identityResponse.status }
                );
            }
            const identityData = await identityResponse.json();
            console.log(identityData);
            email = identityData.account.owner.email; // Updated to fetch the email from the user object
        } catch (error) {
            console.error('Error fetching identity:', error);
            return NextResponse.json(
                { error: 'Failed to fetch identity' },
                { status: 500 }
            );
        }

        // Validate FUB API Key by creating a test lead
        try {
            const response = await axios.post(
                'https://api.followupboss.com/v1/people?deduplicate=false',
                { stage: 'Lead' },
                {
                    headers: {
                        'Authorization': `Basic ${encodedApiKey}`,
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                }
            );

            // Check for successful status codes (2xx range)
            if (response.status < 200 || response.status >= 300) {
                return NextResponse.json(
                    { error: 'Failed to create test lead' },
                    { status: response.status }
                );
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response) {
                    return NextResponse.json(
                        { error: error.response.data.message || 'Failed to validate API key' },
                        { status: error.response.status }
                    );
                } else if (error.request) {
                    return NextResponse.json(
                        { error: 'No response received from Follow Up Boss' },
                        { status: 500 }
                    );
                }
            }
            return NextResponse.json(
                { error: 'Failed to validate API key' },
                { status: 500 }
            );
        }

        // Check if the integration already exists
        const existingIntegration = await db
            .select()
            .from(integrations)
            .where(
                and(
                    eq(integrations.userId, userId),
                    eq(integrations.platformName, 'followupboss')
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

        // Save API key in the integrations table
        await db
            .insert(integrations)
            .values({
                userId: userId,
                platformName: 'followUpBoss',
                credentials: { email: email, apiKey: apiKey }
            });

        return NextResponse.json(
            { message: 'Follow Up Boss integration successful' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error in Follow Up Boss integration:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
