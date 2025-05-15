import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { user_lead_communications } from '@/db/schema/user_lead_communications';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, leadId, title, platform, agenda } = body;
    const newMeeting = await db.insert(user_lead_communications).values({
      user_id: parseInt(userId),  
      lead_id: leadId,
      type: 'MEETING',
      status: 'SCHEDULED',
      details: {
         notes: title,
         platform,
         duration: 1800,
         agenda,
      }
    }).returning();

    return NextResponse.json({
      message: 'Meeting created successfully',
      meeting: newMeeting[0]
    });
  } catch (error) {
    console.error('Error creating meeting:', error);
    return NextResponse.json(
      { error: 'Failed to create meeting' },
      { status: 500 }
    );
  }
}
