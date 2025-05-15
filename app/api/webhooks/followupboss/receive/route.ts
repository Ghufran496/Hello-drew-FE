import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { leads } from '@/db/schema/leads';
import { integrations } from '@/db/schema/integrations';
import { eq, and } from 'drizzle-orm';
import { sql } from 'drizzle-orm';
export async function POST(req: NextRequest) {
    try {
        const payload = await req.json();

        // Fetch account owner email from Follow Up Boss API
        const encodedApiKey = Buffer.from(process.env.FOLLOWUP_BOSS_API_KEY || '').toString('base64');
        const identityResponse = await fetch('https://api.followupboss.com/v1/identity', {
            method: 'GET',
            headers: {
                'Authorization': `Basic ${encodedApiKey}`,
                'Accept': 'application/json'
            }
        });

        if (!identityResponse.ok) {
            return NextResponse.json(
                { error: 'Failed to fetch identity' },
                { status: identityResponse.status }
            );
        }

        const identityData = await identityResponse.json();
        console.log('identityData', identityData);
        const accountOwnerEmail = identityData.account.owner.email;
        

        // Find userId from integrations table using the account owner email
        const integrationRecords = await db.select()
            .from(integrations)
            .where(and(
                eq(integrations.platformName, 'followUpBoss'),
                sql`${integrations.credentials}->>'email' = ${accountOwnerEmail}`
            ));
        console.log('integrationRecords', integrationRecords);

        if (!integrationRecords || integrationRecords.length === 0) {
            return NextResponse.json(
                { error: 'No matching integration found for the account owner email' },
                { status: 404 }
            );
        }

        const userId = integrationRecords[0].userId;
        console.log('userId', userId);
        // Process webhook data
        if (payload.event === 'peopleCreated') {
            console.log('payload', payload);

            // Fetch person details from Follow Up Boss API using the provided URI
            const response = await fetch(payload.uri, {
                headers: {
                    'accept': 'application/json',
                    'content-type': 'application/json',
                    'Authorization': `Basic ${Buffer.from(process.env.FOLLOWUP_BOSS_API_KEY || '').toString('base64')}`,
                    'system': 'hellodrew',
                    'X-System': 'hellodrew'
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || errorData.errorMessage || 'Failed to fetch person details from Follow Up Boss API');
            }

            const responseData = await response.json();
            console.log(responseData);

            // Extract the first person from the response
            const person = responseData.people[0];
            if (!person) {
                throw new Error('No person data found in the response');
            }

            // Extract relevant information
            const { firstName, lastName, emails, phones, stage } = person;
            const name = `${firstName} ${lastName}`.trim();
            const email = emails && emails.length > 0 ? emails[0].value : null;
            const phone = phones && phones.length > 0 ? phones[0].value : null;

            // Format lead for database insertion
            const formattedLead = {
                user_id: userId,
                external_id: person.id,
                source: 'FollowUpBoss',
                name,
                email,
                phone,
                status: stage || 'new',
                created_at: new Date(person.created),
                updated_at: new Date(person.updated)
            };

            // Insert new lead into database
            await db.insert(leads).values(formattedLead);

            console.log(`New lead inserted: ${name}`);
        }
        else if (payload.event === 'peopleUpdated') {
            console.log('peopleUpdated', payload);
        }

        return NextResponse.json(
            { message: 'Webhook processed successfully.' },
            { status: 200 }
        );

    } catch (error) {
        console.error('Error processing Follow Up Boss webhook:', error);
        return NextResponse.json(
            { error: 'Failed to process webhook' },
            { status: 500 }
        );
    }
}