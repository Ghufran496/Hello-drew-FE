import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { leads } from '@/db/schema/leads';
import { user_lead_communications } from '@/db/schema/user_lead_communications';
import { eq } from 'drizzle-orm';
import twilio from 'twilio';

export async function POST(request: NextRequest) {
    try {
        const { userId, leadId } = await request.json();

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

        // Initiate call using Twilio
        const result = await client.calls.create({
            from: process.env.TWILIO_PHONE_NUMBER as string,
            to: lead[0].phone,
            url: process.env.TWILIO_VOICE_URL as string
        });

        // Log the communication in the database
        await db.insert(user_lead_communications).values({
            user_id: userId,
            lead_id: leadId,
            type: 'Call',
            status: result.status,
            details: { sid: result.sid }
        });

        return NextResponse.json({
            message: 'Call initiated successfully',
            result
        });
    } catch (error) {
        console.error('Error initiating call:', error);
        return NextResponse.json(
            { 
                error: 'Failed to initiate call',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}