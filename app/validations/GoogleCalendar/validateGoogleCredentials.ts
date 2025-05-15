import { google } from 'googleapis';

export async function validateGoogleCredentials(accessToken: string): Promise<boolean> {
    try {
        const calendar = google.calendar({ version: 'v3', auth: accessToken });
        
        // Make a test request to the Google Calendar API
        await calendar.calendarList.list();

        return true;
    } catch (error) {
        console.error('Google Calendar validation failed:', error);
        return false;
    }
}