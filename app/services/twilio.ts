import twilio from 'twilio';

const client = twilio(
    process.env.TWILIO_ACCOUNT_SID as string, 
    process.env.TWILIO_AUTH_TOKEN as string
);

interface TwilioResponse {
    status: 'Sent' | 'Initiated' | 'Failed';
    sid?: string;
    error?: string;
}

const TWILIO_NUMBER = process.env.TWILIO_PHONE_NUMBER;
if (!TWILIO_NUMBER) throw new Error('TWILIO_PHONE_NUMBER is not configured');

async function sendSMS(to: string, message: string): Promise<TwilioResponse> {
    try {
        const response = await client.messages.create({
            body: message,
            from: TWILIO_NUMBER,
            to: to,
        });
        return { status: 'Sent', sid: response.sid };
    } catch (error) {
        if (error instanceof Error) {
            console.error('Error sending SMS:', error.message);
            return { status: 'Failed', error: error.message };
        }
        return { status: 'Failed', error: 'Unknown error occurred' };
    }
}

async function makeCall(to: string, twimlUrl: string): Promise<TwilioResponse> {
    try {
        const response = await client.calls.create({
            to: to,
            from: TWILIO_NUMBER as string,
            url: twimlUrl, // URL of a TwiML script for call instructions
        });
        return { status: 'Initiated', sid: response.sid };
    } catch (error) {
        if (error instanceof Error) {
            console.error('Error making call:', error.message);
            return { status: 'Failed', error: error.message };
        }
        return { status: 'Failed', error: 'Unknown error occurred' };
    }
}

export { sendSMS, makeCall };