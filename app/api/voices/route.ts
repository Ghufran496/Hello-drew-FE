import { NextResponse } from 'next/server';
import { db } from '@/db';
import { voices } from '@/db/schema/voices';

export async function GET() {
  try {
    const list = await db.select().from(voices).execute();

    return NextResponse.json({ voices: list }, { status: 200 });
  } catch (error) {
    console.error('Error fetching voices:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
