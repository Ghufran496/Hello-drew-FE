import { NextResponse } from 'next/server';
import { db } from '@/db';
import { calls } from '@/db/schema/calls';
import { appointments } from '@/db/schema/appointments';
import { leads } from '@/db/schema/leads';
import { teamActivity } from '@/db/schema/team_activity';
import { eq, sql } from 'drizzle-orm';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json(
                { error: 'Missing required field: userId' },
                { status: 400 }
            );
        }

        // Fetch Calls Made
        const callsData = await db
            .select({ id: calls.id })
            .from(calls)
            .where(eq(calls.userId, parseInt(userId)));

        // Fetch Appointments Scheduled
        const appointmentsData = await db
            .select({ id: appointments.id })
            .from(appointments)
            .where(eq(appointments.userId, parseInt(userId)));

        // Fetch Lead Pipeline
        const leadsData = await db
            .select({
                status: leads.status,
                count: sql<number>`count(*)`.mapWith(Number)
            })
            .from(leads)
            .where(eq(leads.user_id, parseInt(userId)))
            .groupBy(leads.status);

        // Fetch Team Activity
        const teamActivityData = await db
            .select({
                userId: teamActivity.userId,
                actions: sql<number>`count(*)`.mapWith(Number)
            })
            .from(teamActivity)
            .groupBy(teamActivity.userId);

        return NextResponse.json({
            callsMade: callsData.length,
            appointmentsScheduled: appointmentsData.length,
            leadPipeline: leadsData,
            teamActivity: teamActivityData
        });
    } catch (error) {
        console.error('Error fetching metrics:', error);
        return NextResponse.json(
            { error: 'Failed to fetch metrics' },
            { status: 500 }
        );
    }
}