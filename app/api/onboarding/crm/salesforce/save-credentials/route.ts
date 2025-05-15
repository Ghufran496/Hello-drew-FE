import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { integrations } from '@/db/schema/integrations';
import { Connection } from 'jsforce';
import { eq, and } from 'drizzle-orm';

export async function POST(req: NextRequest) {
    try {
        const { userId, accessToken, refreshToken, instanceUrl } = await req.json();

        if (!userId || !accessToken || !refreshToken || !instanceUrl) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Create a connection to Salesforce
        const conn = new Connection({
            instanceUrl: instanceUrl,
            accessToken: accessToken
        });

        // Fetch the user's email from Salesforce
        const userInfo = await conn.identity();
        const email = userInfo.email;
        console.log(userId)
        // Check if the integration already exists
        const existingIntegration = await db
            .select()
            .from(integrations)
            .where(
                and(
                    eq(integrations.userId, userId),
                    eq(integrations.platformName, 'salesforce')
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

        // Save the credentials and email to the database
        await db.insert(integrations).values({
            userId: userId,
            credentials: {
                accessToken: accessToken,
                refreshToken: refreshToken,
                instanceUrl: instanceUrl,
                email: email
            },
            platformName: 'salesforce'
        });

        return NextResponse.json({ message: 'Credentials saved successfully' });
    } catch (error) {
        console.error('Error saving credentials:', error);
        return NextResponse.json(
            { error: 'Failed to save credentials' },
            { status: 500 }
        );
    }
}
