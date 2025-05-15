import { NextRequest, NextResponse } from 'next/server';
import { getValidCalendlyToken, CalendlyService } from '@/app/services/calendly';

interface CalendlyEventType {
  uri: string;
  name: string;
  // ... other fields
}

interface CalendlyResponse {
  collection: CalendlyEventType[];
  // ... other fields that might be in the response
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const token = await getValidCalendlyToken(parseInt(userId));
    const calendlyService = new CalendlyService();
    
    // Fetch user info to get organization
    const userInfo = await calendlyService.getUserInfo(parseInt(userId));
    const organization = userInfo.current_organization;
    console.log("token", token);

    if (!organization) {
      throw new Error('Failed to retrieve organization information');
    }

    const calendlyUrl = new URL(`https://api.calendly.com/scheduled_events?organization=${organization}`);

    const response = await fetch(calendlyUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch appointments');
    }

    const appointments: CalendlyResponse = await response.json();

    return NextResponse.json({ appointments });
  } catch (error) {
    console.error('Calendly API error:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
