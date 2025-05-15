import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { leads } from '@/db/schema/leads';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
    try {
        const payload = await req.json();

        // Process webhook data for updated leads
        if (payload.event === 'peopleUpdated') {
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

            // Format lead for database update
            const updatedLead = {
                name,
                email,
                phone,
                status: stage || 'updated',
                updated_at: new Date(person.updated)
            };

            // Update lead in database
            await db.update(leads)
                .set(updatedLead)
                .where(eq(leads.external_id, person.id));

            console.log(`Lead updated: ${name}`);
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
