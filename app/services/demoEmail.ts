import FormData from 'form-data';
import Mailgun from 'mailgun.js';
import { UserSchemaType } from '@/lib/schemas';

interface AppointmentDetails {
  datetime: string;
  meetingLink: string;
  rescheduleLink: string;
}

const mailgun = new Mailgun(FormData);
const mg = mailgun.client({
    username: 'api',
    key: process.env.MAILGUN_API_KEY || 'key-yourkeyhere'
});

export async function sendDemoConfirmationEmail(user: UserSchemaType, appointmentDetails: AppointmentDetails) {
    if (!process.env.MAILGUN_API_KEY || !process.env.MAILGUN_DOMAIN) {
        throw new Error('Mailgun configuration is missing');
    }

    try {
        // Send confirmation email to customer
        await mg.messages.create(process.env.MAILGUN_DOMAIN, {
            from: `Hello Drew Team <noreply@${process.env.MAILGUN_DOMAIN}>`,
            to: user.email,
            subject: `Your Hello Drew Demo is Scheduled! 🚀`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
                        .container { background-color: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                        .logo { text-align: center; margin-bottom: 30px; }
                        .logo img { max-width: 150px; height: auto; }
                        .details { margin: 20px 0; }
                        .button { display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; }
                        .footer { margin-top: 30px; font-size: 12px; color: #666; text-align: center; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="logo">
                            <img src="${process.env.NEXT_PUBLIC_APP_URL}/logo-light.png" alt="Hello Drew Logo">
                        </div>
                        
                        <p>Hi ${user.name},</p>
                        
                        <p>Thanks for scheduling a demo with Hello Drew – The Voice of Real Estate. 🎙️</p>
                        
                        <div class="details">
                            <p>✅ Date & Time: ${appointmentDetails.datetime}</p>
                            <p>📍 Location: Online (link below)</p>
                        </div>
                        
                        <p>Click the link below to access your demo at the scheduled time:</p>
                        <p><a href="${appointmentDetails.meetingLink}" class="button">Join Your Demo</a></p>
                        
                        <p>Our team is excited to show you how Drew can transform your real estate business. If you have any questions before your demo, feel free to reply to this email!</p>
                        
                        <p>Looking forward to speaking with you,<br>The Hello Drew Team</p>
                        
                        <p>📩 Need to reschedule? <a href="${appointmentDetails.rescheduleLink}">Click here</a></p>
                        
                        <div class="footer">
                            <p>Hello Drew - The Voice of Real Estate</p>
                            <p><a href="https://www.hellodrew.ai">www.hellodrew.ai</a></p>
                        </div>
                    </div>
                </body>
                </html>
            `
        });

        // Send notification email to internal team
        await mg.messages.create(process.env.MAILGUN_DOMAIN, {
            from: `Hello Drew Team <noreply@${process.env.MAILGUN_DOMAIN}>`,
            to: ['eric@hellodrew.ai', 'support@hellodrew.ai', 'sales@hellodrew.ai'],
            subject: `New Hello Drew Demo Scheduled!`,
            html: `
                <h2>Hey Team,</h2>
                
                <p>A new demo has been scheduled! Here are the details:</p>
                
                <p>👤 Name: ${user.name}<br>
                📧 Email: ${user.email}<br>
                📱 Phone: ${user.phone}<br>
                🏢 Company: ${user.brokerage_name}<br>
                📅 Date & Time: ${appointmentDetails.datetime}</p>
                
                <p>📍 Join the Demo: <a href="${appointmentDetails.meetingLink}">Meeting Link</a></p>
                
                <p>📌 Reschedule/Cancel: <a href="${appointmentDetails.rescheduleLink}">Manage Here</a></p>
                
                <p>Let's make this a great call! 🚀</p>
                
                <p>- Hello Drew Sales & Support</p>
            `
        });

    } catch (error) {
        console.error('Failed to send demo confirmation email:', error);
        throw new Error('Failed to send demo confirmation email');
    }
}

export async function sendDemoReminderEmail(user: UserSchemaType, appointmentDetails: AppointmentDetails) {
    if (!process.env.MAILGUN_API_KEY || !process.env.MAILGUN_DOMAIN) {
        throw new Error('Mailgun configuration is missing');
    }

    try {
        await mg.messages.create(process.env.MAILGUN_DOMAIN, {
            from: `Hello Drew Team <noreply@${process.env.MAILGUN_DOMAIN}>`,
            to: user.email,
            subject: `Your Hello Drew Demo is Coming Up Soon!`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
                        .container { background-color: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <p>Hi ${user.name},</p>
                        
                        <p>Just a quick reminder that your Hello Drew demo is coming up in one hour!</p>
                        
                        <p>📅 Date & Time: ${appointmentDetails.datetime}<br>
                        📍 Join the Demo: <a href="${appointmentDetails.meetingLink}">Click Here</a></p>
                        
                        <p>We can't wait to show you how Drew can revolutionize the way you engage with leads, schedule appointments, and grow your business.</p>
                        
                        <p>See you soon!</p>
                        
                        <p>- The Hello Drew Team</p>
                    </div>
                </body>
                </html>
            `
        });
    } catch (error) {
        console.error('Failed to send demo reminder email:', error);
        throw new Error('Failed to send demo reminder email');
    }
}

export async function sendDemoFollowUpEmail(user: UserSchemaType, signupLink: string) {
    if (!process.env.MAILGUN_API_KEY || !process.env.MAILGUN_DOMAIN) {
        throw new Error('Mailgun configuration is missing');
    }

    try {
        await mg.messages.create(process.env.MAILGUN_DOMAIN, {
            from: `Hello Drew Team <noreply@${process.env.MAILGUN_DOMAIN}>`,
            to: user.email,
            subject: `Thanks for Your Time! Here's What's Next 🚀`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
                        .container { background-color: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                        .button { display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <p>Hi ${user.name},</p>
                        
                        <p>Thanks for joining us for your Hello Drew demo! We hope you're as excited as we are about what Drew can do for your business.</p>
                        
                        <p>Here's a quick recap of what we covered:<br>
                        ✅ How Drew automates lead follow-ups<br>
                        ✅ Seamless CRM and scheduling integrations<br>
                        ✅ AI-driven insights to boost conversions</p>
                        
                        <p>📌 Ready to get started? <a href="${signupLink}" class="button">Sign Up Here</a></p>
                        
                        <p>If you have any questions or need more info, just reply to this email—we'd love to help!</p>
                        
                        <p>Looking forward to working together,<br>
                        The Hello Drew Team</p>
                    </div>
                </body>
                </html>
            `
        });
    } catch (error) {
        console.error('Failed to send demo follow-up email:', error);
        throw new Error('Failed to send demo follow-up email');
    }
}

export async function sendDemoNoShowEmail(user: UserSchemaType, rescheduleLink: string) {
    if (!process.env.MAILGUN_API_KEY || !process.env.MAILGUN_DOMAIN) {
        throw new Error('Mailgun configuration is missing');
    }

    try {
        await mg.messages.create(process.env.MAILGUN_DOMAIN, {
            from: `Hello Drew Team <noreply@${process.env.MAILGUN_DOMAIN}>`,
            to: user.email,
            subject: `We Missed You! Let's Reschedule Your Hello Drew Demo`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
                        .container { background-color: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                        .button { display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <p>Hi ${user.name},</p>
                        
                        <p>We noticed you weren't able to make your Hello Drew demo today. No worries—let's find a time that works better for you!</p>
                        
                        <p>📅 <a href="${rescheduleLink}" class="button">Click to Choose a New Time</a></p>
                        
                        <p>Drew is ready to help automate your real estate business, so let's get you set up for success. Looking forward to chatting soon!</p>
                        
                        <p>The Hello Drew Team</p>
                    </div>
                </body>
                </html>
            `
        });
    } catch (error) {
        console.error('Failed to send demo no-show email:', error);
        throw new Error('Failed to send demo no-show email');
    }
}