import { NextResponse } from 'next/server';
import { db } from '@/db';
import { integrations } from '@/db/schema/integrations';
import { eq } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const userIntegration = await db
      .select()
      .from(integrations)
      .where(eq(integrations.userId, Number(userId)) && eq(integrations.platformName, 'hubspot'))
      .limit(1);

      if (!userIntegration || userIntegration.length === 0 || !userIntegration[0].credentials) {
      return NextResponse.json(
        { error: 'Access token not found for the user' },
        { status: 404 }
      );
    }

    const credentials = userIntegration[0].credentials as {
      email: string;
      accessToken: string;
    };

    const accessToken = credentials.accessToken;

    const response = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch HubSpot contacts: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('HubSpot API Error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to fetch HubSpot contacts' },
        { status: 500 }
      );
    } else {
      console.error('Unexpected error:', error);
      return NextResponse.json(
        { error: 'An unexpected error occurred' },
        { status: 500 }
      );
    }
  }
}
