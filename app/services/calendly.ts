import axios from 'axios';
import { db } from '@/db';
import { integrations } from '@/db/schema/integrations';
import { eq, and } from 'drizzle-orm';

interface CalendlyTokens {
  token: string;
  refresh_token: string;
  expires_at: number;
}

export class CalendlyService {
  private clientId: string;
  private clientSecret: string;
  private baseUrl: string = 'https://api.calendly.com';
  private accessToken: string = '';
  constructor() {
    const clientId = process.env.CALENDLY_CLIENT_ID;
    const clientSecret = process.env.CALENDLY_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      throw new Error('CALENDLY_CLIENT_ID and CALENDLY_CLIENT_SECRET environment variables are required');
    }
    this.clientId = clientId;
    this.clientSecret = clientSecret;
  }

  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json'
    };
  }

  async getAuthUrl(userId: string) {
    const clientId = process.env.CALENDLY_CLIENT_ID;
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/onboarding/calendly/callback`;
    return `https://auth.calendly.com/oauth/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&state=${userId}`;
  }

  async getUserInfo(state: number, access_token?: string) {
    try {
      let response;
      if (access_token) {
        this.accessToken = access_token;
        response = await axios.get(`${this.baseUrl}/users/me`, {
          headers: this.getHeaders()
        });
      } else {
        // Fetch credentials from the database
        const integration = await db
          .select()
          .from(integrations)
          .where(
            and(
              eq(integrations.userId, state),
              eq(integrations.platformName, 'calendly')
            )
          )
          .limit(1);

        if (!integration[0]?.credentials) {
          throw new Error('Calendly not connected');
        }

        const credentials = integration[0].credentials as {
          token: string;
          refresh_token: string;
          expires_at: number;
        };
        console.log("credentials", credentials);
        this.accessToken = credentials.token;
        response = await axios.get(`${this.baseUrl}/users/me`, {
          headers: {
            'Authorization': `Bearer ${credentials.token}`,
            'Content-Type': 'application/json'
          }
        });
      }

      if (response.status !== 200) {
        throw new Error(response.data.message || 'Failed to fetch user information');
      }

      return response.data.resource;
    } catch (error) {
      console.error('Error fetching user information:', error);
      throw error;
    }
  }

  async getTokens(code: string) {
    try {
      console.log('Exchanging authorization code for tokens...');
      console.log('Code:', code);
      console.log('Redirect URI:', `${process.env.NEXT_PUBLIC_APP_URL}/api/onboarding/calendly/callback`);
      
      const response = await axios.post('https://auth.calendly.com/oauth/token', {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/onboarding/calendly/callback`
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      
      console.log('Token exchange response:', response.data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Token exchange error:', error.response?.data || error.message);
      } else {
        console.error('Token exchange error:', error);
      }
      throw new Error('Failed to exchange authorization code');
    }
  }

  async getCalendarEvents(userId: number) {
    try {
      // Fetch credentials from the database
      const integration = await db
        .select()
        .from(integrations)
        .where(
          and(
            eq(integrations.userId, userId),
            eq(integrations.platformName, 'calendly')
          )
        )
        .limit(1);

      if (!integration[0]?.credentials) {
        throw new Error('Calendar not connected');
      }

      const credentials = integration[0].credentials as {
        access_token: string;
        refresh_token: string;
        expiry: string;
      };

      // First get the user info to get their URI
      const userInfo = await this.getUserInfo(userId);
      const userUri = userInfo.uri;

      const response = await axios.get(`${this.baseUrl}/scheduled_events`, {
        headers: {
          'Authorization': `Bearer ${credentials.access_token}`,
          'Content-Type': 'application/json'
        },
        params: {
          user: userUri,
          min_start_time: new Date().toISOString(),
          status: 'active'
        }
      });

      console.log(`Total events fetched: ${response.data.collection.length}`);

      const appointments = response.data.collection.map((event: { uri: string, name: string, start_time: string, end_time: string, event_guests: { email: string, name: string }[], description?: string, location?: string[], status: string }) => ({
        id: event.uri,
        title: event.name,
        startTime: event.start_time,
        endTime: event.end_time,
        attendees: event.event_guests.map((guest: { email: string, name: string }) => ({
          email: guest.email,
          name: guest.name,
          status: 'accepted'
        })),
        description: event.description || '',
        location: event.location?.join(', ') || '',
        meetLink: event.location?.find((loc: string) => loc.startsWith('http')),
        status: event.status
      }));

      return appointments;
    } catch (error) {
      console.error('Error fetching appointments:', error);
      throw error;
    }
  }

  async getAvailableSlots(userUri: string, date: string) {
    try {
      const startDateTime = new Date(date);
      startDateTime.setHours(0, 0, 0, 0);
      const endDateTime = new Date(date);
      endDateTime.setHours(23, 59, 59, 999);

      const response = await axios.get(`${this.baseUrl}/user_availability_schedules`, {
        headers: this.getHeaders(),
        params: {
          user: userUri,
          start_time: startDateTime.toISOString(),
          end_time: endDateTime.toISOString()
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error in getAvailableSlots:', error);
      throw error;
    }
  }

  async bookSlot(eventTypeUri: string, eventDetails: { 
    start_time: string, 
    end_time: string, 
    email: string, 
    name: string, 
    timezone: string,
    questions_and_answers: Array<{ question: string, answer: string }>
  }) {
    try {
      const response = await axios.post(`${this.baseUrl}/scheduled_events`, {
        event_type: eventTypeUri,
        start_time: eventDetails.start_time,
        end_time: eventDetails.end_time,
        timezone: eventDetails.timezone,
        event_guests: [{
          email: eventDetails.email,
          name: eventDetails.name
        }],
        questions_and_answers: eventDetails.questions_and_answers
      }, {
        headers: this.getHeaders()
      });

      console.log('Event booked:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in bookSlot:', error);
      throw error;
    }
  }
}

async function refreshCalendlyToken(userId: number, refresh_token: string): Promise<CalendlyTokens> {
  const response = await fetch('https://auth.calendly.com/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: process.env.CALENDLY_CLIENT_ID!,
      client_secret: process.env.CALENDLY_CLIENT_SECRET!,
      refresh_token: refresh_token,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to refresh Calendly token');
  }

  const tokens: CalendlyTokens = await response.json();
  
  // Update the tokens in the database
  await db
    .update(integrations)
    .set({ credentials: tokens })
    .where(
      and(
        eq(integrations.userId, userId),
        eq(integrations.platformName, 'calendly')
      )
    );

  return tokens;
}

export async function getValidCalendlyToken(userId: number): Promise<string> {
  const integration = await db
    .select()
    .from(integrations)
    .where(
      and(
        eq(integrations.userId, userId),
        eq(integrations.platformName, 'calendly')
      )
    )
    .limit(1);

  if (!integration[0]?.credentials) {
    throw new Error('Calendly not connected');
  }

  const credentials = integration[0].credentials as CalendlyTokens;
  // console.log("credentials", credentials);
  if (Date.now() >= credentials.expires_at) {
    console.log("Token has expired, refreshing...");
    // Token has expired, refresh it
    const newTokens = await refreshCalendlyToken(userId, credentials.refresh_token);
    return newTokens.token;
  }

  return credentials.token;
}