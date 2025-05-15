import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { agents } from '@/db/schema/agents';
import { eq, and } from 'drizzle-orm';
import { users } from '@/db/schema/users';

// GET: Fetch a single agent by agentId
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = parseInt(searchParams.get('userId') || '0', 10);

    const agentId = (await params).agentId;

    if (!userId)
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

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

    if (isNaN(+agentId)) {
      return NextResponse.json({ error: 'Invalid agent ID' }, { status: 400 });
    }

    const agent = await db
      .select()
      .from(agents)
      .where(and(eq(agents.id, +agentId), eq(agents.user_id, userId))) // Ensure agents.user_id is used
      .limit(1)
      .execute();

    if (!agent.length) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    return NextResponse.json({ agent: agent[0] }, { status: 200 });
  } catch (error) {
    console.error('Error fetching agent:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH: Update an existing agent by agentId
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = parseInt(searchParams.get('userId') || '0', 10);

    const agentId = (await params).agentId;
    const body = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

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

    if (isNaN(+agentId)) {
      return NextResponse.json({ error: 'Invalid agent ID' }, { status: 400 });
    }

    const updatedAgent = await db
      .update(agents)
      .set(body)
      .where(and(eq(agents.id, +agentId), eq(agents.user_id, userId))) // Ensure agents.user_id is used
      .returning()
      .execute();

    if (!updatedAgent.length) {
      return NextResponse.json(
        { error: 'Agent not found or no changes made' },
        { status: 404 }
      );
    }

    return NextResponse.json({ agent: updatedAgent[0] }, { status: 200 });
  } catch (error) {
    console.error('Error updating agent:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE: Remove an agent by agentId
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = parseInt(searchParams.get('userId') || '0', 10);

    const agentId = (await params).agentId;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

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

    if (isNaN(+agentId)) {
      return NextResponse.json({ error: 'Invalid agent ID' }, { status: 400 });
    }

    const deletedAgent = await db
      .delete(agents)
      .where(and(eq(agents.id, +agentId), eq(agents.user_id, userId))) // Ensure agents.user_id is used
      .returning()
      .execute();

    if (!deletedAgent.length) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    return NextResponse.json(
      { message: 'Agent deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting agent:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
