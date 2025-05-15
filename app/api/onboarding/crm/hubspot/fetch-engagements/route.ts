import { NextResponse } from 'next/server';

export async function GET() {
  try {
    if (!process.env.HUBSPOT_ACCESS_TOKEN) {
      throw new Error('HUBSPOT_ACCESS_TOKEN is not defined in environment variables');
    }

    const response = await fetch('https://api.hubapi.com/engagements/v1/engagements/paged', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.HUBSPOT_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch HubSpot engagements: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('HubSpot API Error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to fetch HubSpot engagements' },
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
