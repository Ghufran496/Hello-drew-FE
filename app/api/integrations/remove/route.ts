import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { integrations } from '@/db/schema/integrations';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const { platformName, userId } = await req.json();

    if (!platformName || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: platformName and userId' },
        { status: 400 }
      );
    }

    const result = await db
      .delete(integrations)
      .where(eq(integrations.platformName, platformName) && eq(integrations.userId, userId))
      .returning();

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Integration not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Integration removed successfully' });
  } catch (error) {
    console.error('Error removing integration:', error);
    return NextResponse.json(
      { error: 'Failed to remove integration' },
      { status: 500 }
    );
  }
}
