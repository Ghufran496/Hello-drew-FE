import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { db } from '@/db';
import { integrations } from '@/db/schema/integrations';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
    try {
        const { userId } = await req.json();

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            );
        }

        // Fetch credentials from the database
        const userIntegration = await db
            .select()
            .from(integrations)
            .where(eq(integrations.userId, Number(userId)) && eq(integrations.platformName, 'followupboss'))
            .limit(1);

        if (!userIntegration || userIntegration.length === 0 || !userIntegration[0].credentials) {
            return NextResponse.json(
                { error: 'Credentials not found' },
                { status: 404 }
            );
        }

        const credentials = userIntegration[0].credentials as {
            apiKey: string;
        };

        // Base64 encode the API key
        const encodedApiKey = Buffer.from(credentials.apiKey).toString('base64');

        // Fetch tasks from Follow Up Boss
        try {
            const response = await axios.get(
                'https://api.followupboss.com/v1/tasks',
                {
                    headers: {
                        'Authorization': `Basic ${encodedApiKey}`,
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                }
            );

            // Check for successful status codes (2xx range)
            if (response.status >= 200 && response.status < 300) {
                return NextResponse.json(
                    { tasks: response.data },
                    { status: 200 }
                );
            } else {
                return NextResponse.json(
                    { error: 'Failed to fetch tasks' },
                    { status: response.status }
                );
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response) {
                    return NextResponse.json(
                        { error: error.response.data.message || 'Failed to fetch tasks' },
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
                { error: 'Failed to fetch tasks' },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('Error fetching tasks from Follow Up Boss:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
