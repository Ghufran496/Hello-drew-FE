import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { integrations } from '@/db/schema/integrations';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');


        if (!userId ) {
            return NextResponse.json(
                { error: 'Missing required parameters' },
                { status: 400 }
            );
        }

        // Get user's Calendly credentials
        const integration = await db
            .select()
            .from(integrations)
            .where(eq(integrations.userId, parseInt(userId)) && eq(integrations.platformName, 'calendly'))
            .limit(1);

        if (!integration[0]?.credentials) {
            return NextResponse.json(
                { error: 'Calendar not connected' },
                { status: 404 }
            );
        }

        const credentials = integration[0].credentials as {
            token: string;
            refresh_token: string;
            expiry: string;
        };
        console.log("credentials", credentials.token);
        // Fetch user's UUID first
        const userResponse = await fetch('https://api.calendly.com/users/me', {
            headers: {
                'Authorization': `Bearer ${credentials.token}`
            }
        });

        if (!userResponse.ok) {
            throw new Error('Failed to fetch user data');
        }

        const userData = await userResponse.json();
        const userUuid = userData.resource.uri.split('/').pop();
       
        // Fetch busy slots for the specified date
       

        const availableSlotsResponse = await fetch(
            `https://api.calendly.com/user_availability_schedules?user=https://api.calendly.com/users/${userUuid}`,
            {
                headers: {
                    'Authorization': `Bearer ${credentials.token}`
                }
            }
        );

        if (!availableSlotsResponse.ok) {
            return NextResponse.json(
                { error: 'Failed to fetch available slots' },
                { status: availableSlotsResponse.status }
            );
        }

        const availableSlotsData = await availableSlotsResponse.json();
        console.log("availableSlotsData", availableSlotsData);
        return NextResponse.json(availableSlotsData);

       

      

        

    } catch (error) {
        console.error('Error fetching available slots:', error);
        return NextResponse.json(
            { error: 'Failed to fetch available slots', details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}

