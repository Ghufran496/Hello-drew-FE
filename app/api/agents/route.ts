import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { agents } from '@/db/schema/agents';
import { eq, ilike, and, sql, SQL } from 'drizzle-orm';
import { users } from '@/db/schema/users';

// POST: Create a new agent
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const body = await request.json();
    const userIdParam = searchParams.get('userId');
    if (!userIdParam) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    const userId = parseInt(userIdParam, 10);

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

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

    const { name, voice, welcomeMessage, tone, prompt } = body;

    if (!userId || !name || !voice || !welcomeMessage || !prompt) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const [newAgent] = await db
      .insert(agents)
      .values({
        user_id: userId,
        name,
        voiceId: voice,
        welcomeMessage,
        tone: tone || {
          name: 'friendly-conversational',
          description: 'Warm, approachable, and casual to build rapport.',
        },
        prompt,
      })
      .returning()
      .execute();

    return NextResponse.json({ agent: newAgent }, { status: 201 });
  } catch (error) {
    console.error('Error creating agent:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET: Fetch all agents with pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const skip = parseInt(searchParams.get('skip') || '0', 10);
    const take = parseInt(searchParams.get('take') || '10', 10);
    const userIdParam = searchParams.get('userId');
    const searchTerm = searchParams.get('searchTerm');

    // Ensure userId is valid
    if (!userIdParam) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    const userId = parseInt(userIdParam, 10);
    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid User ID' }, { status: 400 });
    }

    const whereConditions: SQL<unknown>[] = [
      eq(agents.user_id, userId),
      ...(searchTerm ? [ilike(agents.name, `%${searchTerm}%`)] : []),
    ];

    const finalWhereCondition =
      whereConditions.length > 1 ? and(...whereConditions) : whereConditions[0];

    // Fetch filtered agents with pagination
    const agentsData = await db
      .select()
      .from(agents)
      .where(finalWhereCondition)
      .limit(take)
      .offset(skip)
      .execute();

    // Get total count of matching agents
    const totalAgents = await db
      .select({ count: sql<number>`count(*)` })
      .from(agents)
      .where(finalWhereCondition)
      .execute();

    const total = totalAgents[0]?.count || 0;
    const nextCursor = skip + take < total ? skip + take : undefined;

    return NextResponse.json(
      {
        agents: agentsData,
        pagination: { skip, take, total, nextCursor },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching agents:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
