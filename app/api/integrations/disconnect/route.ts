import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { integrations } from '@/db/schema/integrations';
import { and, eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const { userId, platformName } = await request.json();

    if (!userId || !platformName) {
      return NextResponse.json(
        { error: 'User ID and platform name are required' },
        { status: 400 }
      );
    }

    await db.delete(integrations)
      .where(
        and(
          eq(integrations.userId, userId),
          eq(integrations.platformName, platformName)
        )
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error disconnecting integration:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect integration' },
      { status: 500 }
    );
  }
} 