import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { leads } from '@/db/schema/leads';
import { user_lead_communications } from '@/db/schema/user_lead_communications';
import { eq } from 'drizzle-orm';
import twilio from 'twilio';
// import { checkSession } from '@/app/middleware/checkSession';

export async function POST(request: NextRequest) {
    // Check session first
    // const sessionResponse = await checkSession(request);
    // if (sessionResponse.status === 401) {
    //     return sessionResponse;
    // }

    try {
        const { userId, leadId, message } = await request.json();

        // Fetch lead's phone number
        const lead = await db
            .select({ phone: leads.phone })
            .from(leads)
            .where(eq(leads.id, leadId))
            .limit(1);

        if (!lead || lead.length === 0 || !lead[0].phone) {
            return NextResponse.json(
                { error: 'Lead not found or has no phone number' },
                { status: 404 }
            );
        }

        // Initialize Twilio client
        const client = twilio(
            process.env.TWILIO_ACCOUNT_SID as string,
            process.env.TWILIO_AUTH_TOKEN as string
        );

        // Send SMS using Twilio
        const result = await client.messages.create({
            body: message,
            from: process.env.TWILIO_PHONE_NUMBER as string,
            to: lead[0].phone
        });

        // Log the communication in the database
        await db.insert(user_lead_communications).values({
            user_id: userId,
            lead_id: leadId,
            type: 'SMS',
            status: result.status,
            details: { message, sid: result.sid }
        });

        return NextResponse.json({
            message: 'SMS sent successfully',
            result
        });
    } catch (error) {
        console.error('Error sending SMS:', error);
        return NextResponse.json(
            { 
                error: 'Failed to send SMS',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
