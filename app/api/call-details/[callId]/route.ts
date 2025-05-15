import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { eq } from 'drizzle-orm';
import { calls } from '@/db/schema/calls';
import { users } from '@/db/schema/users';
import { user_drew_communications } from '@/db/schema/user_drew_communications';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ callId: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = parseInt(searchParams.get('userId') || '0', 10);

    if (!userId)
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );

    if (userId) {
      const userExists = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1)
        .execute();

      if (userExists.length === 0) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
    }

    const callId = (await params).callId;

    if (isNaN(+callId)) {
      return NextResponse.json({ error: 'Invalid call ID' }, { status: 400 });
    }

    // Find the related user_drew_communication_id from the calls table
    const call = await db
      .select({ communicationId: calls.user_drew_communication_id })
      .from(calls)
      .where(eq(calls.id, +callId))
      .limit(1)
      .execute();

    if (!call.length || !call[0].communicationId) {
      return NextResponse.json(
        { error: 'No communication data found for this call' },
        { status: 404 }
      );
    }

    // Fetch user_drew_communications using the communication ID
    const communication = await db
      .select()
      .from(user_drew_communications)
      .where(eq(user_drew_communications.id, call[0].communicationId))
      .limit(1)
      .execute();

    if (!communication.length) {
      return NextResponse.json(
        { error: 'Communication record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ communication: communication[0] });
  } catch (error) {
    console.error('Error fetching communication by call ID:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
