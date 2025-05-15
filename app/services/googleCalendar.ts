import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { db } from '@/db';
import { integrations } from '@/db/schema/integrations';
import { eq, and } from 'drizzle-orm';

export class GoogleCalendarService {
  private oauth2Client: OAuth2Client;

  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID_CALENDER,
      process.env.GOOGLE_CLIENT_SECRET_CALENDER,
      `${process.env.NEXT_PUBLIC_APP_URL}/api/onboarding/google_calendar/callback`
    );
  }

  async getAuthUrl(userId: string) {
   
    const scopes = [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/gmail.send',
      'openid'
  ];
    
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      include_granted_scopes: true,
      state: userId,
      prompt: 'consent'
      
    });
  }

  async getTokens(code: string) {
    const { tokens } = await this.oauth2Client.getToken(code);
    return tokens;
  }

  async getCalendarEvents(credentials: { access_token: string; refresh_token: string; expiry: string }) {
    try {
        // Set credentials including refresh token
        this.oauth2Client.setCredentials({
            access_token: credentials.access_token,
            refresh_token: credentials.refresh_token,
            expiry_date: new Date(credentials.expiry).getTime()
        });

        const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
        
        console.log('Fetching calendar events...');
        const response = await calendar.events.list({
            calendarId: 'primary',
            timeMin: new Date().toISOString(),
            maxResults: 2500,
            singleEvents: true,
            orderBy: 'startTime',
        });
        
        console.log(`Total events fetched: ${response.data.items?.length || 0}`);
        
        const appointments = response.data.items
            ?.filter(event => {
                const isAppointment = 
                    (event.attendees && event.attendees.length > 0) ||
                    event.summary?.toLowerCase().includes('appointment') ||
                    event.description?.toLowerCase().includes('appointment');
                
                if (isAppointment) {
                    console.log('Appointment found:', event.summary);
                }
                
                return isAppointment;
            })
            .map(event => ({
                id: event.id,
                title: event.summary,
                startTime: event.start?.dateTime || event.start?.date,
                endTime: event.end?.dateTime || event.end?.date,
                attendees: event.attendees?.map(attendee => ({
                    email: attendee.email,
                    name: attendee.displayName,
                    status: attendee.responseStatus
                })),
                description: event.description,
                location: event.location,
                meetLink: event.hangoutLink || event.conferenceData?.entryPoints?.[0]?.uri,
                status: event.status
            }));

        return appointments;
    } catch (error) {
        console.error('Error fetching appointments:', error);
        throw error;
    }
  }

  async getAvailableSlots(credentials: { access_token: string; refresh_token: string; expiry: string }, date: string) {
    try {
      this.oauth2Client.setCredentials(credentials);

      // Check if the token is expired and refresh if necessary
      if (new Date(credentials.expiry) <= new Date()) {
        const newCredentials = await this.oauth2Client.refreshAccessToken();
        this.oauth2Client.setCredentials(newCredentials.credentials);
      }

      const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

      const startDateTime = new Date(date);
      startDateTime.setHours(0, 0, 0, 0);
      const endDateTime = new Date(date);
      endDateTime.setHours(23, 59, 59, 999);

      const response = await calendar.freebusy.query({
        requestBody: {
          timeMin: startDateTime.toISOString(),
          timeMax: endDateTime.toISOString(),
          items: [{ id: 'primary' }],
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error in getAvailableSlots:', error);
      throw error;
    }
  }
  async bookSlot(credentials: { access_token: string; refresh_token: string; expiry: string }, eventDetails: { summary: string; location: string; description: string; start: { dateTime: string; timeZone: string }; end: { dateTime: string; timeZone: string }; attendees: { email: string }[] }) {
    try {
        this.oauth2Client.setCredentials({
            access_token: credentials.access_token,
            refresh_token: credentials.refresh_token,
            expiry_date: new Date(credentials.expiry).getTime()
        });

        const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

        // Match the exact structure of the incoming eventDetails
        const event = {
            summary: eventDetails.summary,
            location: eventDetails.location,
            description: eventDetails.description,
            start: {
                dateTime: eventDetails.start.dateTime,  // Changed from startDateTime
                timeZone: eventDetails.start.timeZone
            },
            end: {
                dateTime: eventDetails.end.dateTime,    // Changed from endDateTime
                timeZone: eventDetails.end.timeZone
            },
            attendees: eventDetails.attendees,          // Use the full attendees array
            reminders: {
                useDefault: true
            }
        };

        console.log('Creating event with details:', event); // Debug log

        const response = await calendar.events.insert({
            calendarId: 'primary',
            requestBody: event,
            sendUpdates: 'all'
        });

        return response.data;
    } catch (error) {
        console.error('Error in bookSlot:', error);
        throw error;
    }
}

async getGoogleCalendarCredentials() {
  try {
    const integration = await db
      .select()
      .from(integrations)
      .where(
        and(
          eq(integrations.platformName, 'google_calendar'),
          eq(integrations.userId, 211) // Using admin user ID for demo scheduling
        )
      )
      .limit(1);

    if (!integration || integration.length === 0) {
      throw new Error('Google Calendar integration not found');
    }

    const credentials = integration[0].credentials as {
      access_token: string;
      refresh_token: string;
      expiry: string;
    };

    return credentials;
  } catch (error) {
    console.error('Error fetching Google Calendar credentials:', error);
    throw error;
  }
}

async createDemoMeeting(date: Date, timeSlot: string, attendeeDetails: { email: string; name: string }) {
  try {
    // Fetch credentials from database
    const credentials = await this.getGoogleCalendarCredentials();

    // Initialize credentials with refresh token
    this.oauth2Client.setCredentials({
      access_token: credentials.access_token,
      refresh_token: credentials.refresh_token,
      expiry_date: new Date(credentials.expiry).getTime()
    });

    // Check if token is expired or will expire soon (within 5 minutes)
    const now = Date.now();
    if (!credentials.expiry || new Date(credentials.expiry).getTime() < (now + 5 * 60 * 1000)) {
      try {
        const { credentials: newCredentials } = await this.oauth2Client.refreshAccessToken();
        
        // Update the client with new credentials
        this.oauth2Client.setCredentials(newCredentials);

        // Update credentials in database
        await db
          .update(integrations)
          .set({
            credentials: {
              access_token: newCredentials.access_token,
              refresh_token: newCredentials.refresh_token || credentials.refresh_token, // Keep old refresh token if new one isn't provided
              expiry: new Date(newCredentials.expiry_date!).toISOString()
            }
          })
          .where(
            and(
              eq(integrations.platformName, 'google_calendar'),
              eq(integrations.userId, 211)
            )
          );

        console.log('New access token generated and stored in database');
      } catch (refreshError) {
        console.error('Error refreshing access token:', refreshError);
        throw new Error('Failed to refresh Google Calendar access token');
      }
    }

    const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

    // Parse timeSlot and create start/end times
    const [time, meridiem] = timeSlot.split(' ');
    const [hours, minutes] = time.split(':');
    let hour = parseInt(hours);
    if (meridiem === 'PM' && hour !== 12) hour += 12;
    if (meridiem === 'AM' && hour === 12) hour = 0;

    // Create the date in PST timezone
    const pstDate = new Date(date.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
    pstDate.setHours(hour, parseInt(minutes), 0, 0);

    // Calculate end time (30 minutes later)
    const pstEndDate = new Date(pstDate);
    pstEndDate.setMinutes(pstDate.getMinutes() + 30);

    const event = {
      summary: `Hello Drew Demo with ${attendeeDetails.name}`,
      description: 'Demo session for Hello Drew - The Voice of Real Estate',
      start: {
        dateTime: pstDate.toISOString().replace(/\.\d{3}Z$/, '-07:00'), // Force PST offset
        timeZone: 'America/Los_Angeles',
      },
      end: {
        dateTime: pstEndDate.toISOString().replace(/\.\d{3}Z$/, '-07:00'), // Force PST offset
        timeZone: 'America/Los_Angeles',
      },
      attendees: [
        { email: attendeeDetails.email },
        { email: 'eric@hellodrew.ai' },
        { email: 'support@hellodrew.ai' },
        { email: 'sales@hellodrew.ai' }
      ],
      conferenceData: {
        createRequest: {
          requestId: `demo-${Date.now()}`,
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      },
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
      conferenceDataVersion: 1,
      sendUpdates: 'all',
    });

    // Create a properly encoded reschedule link
    const eventId = response.data.id;
    const encodedEventId = eventId?.replace(/\+/g, '%2B')
      .replace(/\//g, '%2F')
      .replace(/=/g, '%3D');
      
    const rescheduleLink = `https://calendar.google.com/calendar/event?action=RESPOND&eid=${encodedEventId}`;

    return {
      meetingLink: response.data.hangoutLink || '',
      eventId: response.data.id || '',
      rescheduleLink: rescheduleLink
    };
  } catch (error) {
    console.error('Error creating Google Calendar event:', error);
    throw error;
  }
}
}
