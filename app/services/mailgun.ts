import FormData from 'form-data';
import Mailgun from 'mailgun.js';

const mailgun = new Mailgun(FormData);
const mg = mailgun.client({
    username: 'api', 
    key: process.env.MAILGUN_API_KEY || 'key-yourkeyhere'
});

export async function sendVerificationEmail(email: string, token: string) {
    if (!process.env.MAILGUN_API_KEY || !process.env.MAILGUN_DOMAIN) {
        throw new Error('Mailgun configuration is missing');
    }

    const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify?token=${token}`;

    try {
        await mg.messages.create(process.env.MAILGUN_DOMAIN, {
            from: process.env.MAILGUN_FROM_EMAIL || 'noreply@yourapp.com',
            to: [email],
            subject: 'Verify Your Email',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
                        .container { background-color: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                        .logo { text-align: center; margin-bottom: 30px; }
                        .logo img { max-width: 150px; height: auto; }
                        .button { display: inline-block; padding: 12px 24px; background-color: #0070f3; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; color: white !important; }
                        .footer { margin-top: 30px; font-size: 12px; color: #666; text-align: center; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="logo">
                            <img src="${process.env.NEXT_PUBLIC_APP_URL}/logo-light.png" alt="Company Logo">
                        </div>
                        <h2>Welcome to Our Platform!</h2>
                        <p>Thank you for signing up. To get started, please verify your email address by clicking the button below:</p>
                        <div style="text-align: center;">
                            <a href="${verificationLink}" class="button">Verify Email Address</a>
                        </div>
                        <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
                        <p style="word-break: break-all; font-size: 14px;">${verificationLink}</p>
                        <p>This link will expire in 24 hours for security reasons.</p>
                        <div class="footer">
                            <p>If you didn't create an account, you can safely ignore this email.</p>
                            <p>&copy; ${new Date().getFullYear()} Your Company Name. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        })
        .then(msg => console.log('Email sent successfully:', msg))
        .catch(err => {
            console.error('Failed to send verification email:', err);
            throw err;
        });
    } catch (error) {
        console.error('Failed to send verification email:', error);
        throw new Error('Failed to send verification email');
    }
}