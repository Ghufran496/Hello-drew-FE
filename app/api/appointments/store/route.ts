import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { appointments } from '@/db/schema/appointments';

interface ParticipantLead {
    id: number | null;
    name: string;
    email: string;  
    phone: string;
}

interface ParticipantDetails {
    lead: ParticipantLead;
    duration: number;
    event_id: string;
    location: string;
    description: string;
    calendar_link: string;
}

interface AppointmentData {
    userId: number;
    appointmentTime: string;
    status: string;
    participantDetails: ParticipantDetails;
}

export async function POST(request: NextRequest) {
    try {
        const { userId, appointments: appointmentsData } = await request.json() as {
            userId: number;
            appointments: AppointmentData[];
        };

        // Validate required fields
        if (!userId || !appointmentsData) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Insert appointments into database
        const insertedAppointments = await db.insert(appointments).values(
            appointmentsData.map((appointment: AppointmentData) => ({
                userId: appointment.userId,
                appointmentTime: new Date(appointment.appointmentTime),
                status: appointment.status === 'active' ? 'scheduled' : appointment.status,
                participantDetails: appointment.participantDetails
            }))
        );

        return NextResponse.json({
            success: true,
            appointments: insertedAppointments
        });

    } catch (error) {
        console.error('Error storing appointments:', error);
        return NextResponse.json(
            { error: 'Failed to store appointments' },
            { status: 500 }
        );
    }
}
