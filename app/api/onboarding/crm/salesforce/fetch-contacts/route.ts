import { NextRequest, NextResponse } from 'next/server';
import { Connection } from 'jsforce';
import { db } from '@/db';
import { integrations } from '@/db/schema/integrations';
import { eq } from 'drizzle-orm';

export async function GET(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams;
        const userId = searchParams.get('userId');

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
            .where(eq(integrations.userId, Number(userId)) && eq(integrations.platformName, 'salesforce'))
            .limit(1);

        if (!userIntegration || userIntegration.length === 0 || !userIntegration[0].credentials) {
            return NextResponse.json(
                { error: 'Credentials not found' },
                { status: 404 }
            );
        }

        const credentials = userIntegration[0].credentials as {
            email: string;
            accessToken: string;
            instanceUrl: string;
            refreshToken: string;
        };

        // Create a connection to Salesforce
        const conn = new Connection({
            instanceUrl: credentials.instanceUrl,
            accessToken: credentials.accessToken
        });

        // Fetch contacts from Salesforce
        const contacts = await conn.sobject("Contact").find({}, 'Id, Name, Email');

        return NextResponse.json({ contacts });
    } catch (error) {
        console.error('Error fetching contacts:', error);
        return NextResponse.json(
            { error: 'Failed to fetch contacts' },
            { status: 500 }
        );
    }
}
