import FormData from 'form-data';
import Mailgun from 'mailgun.js';
import { UserSchemaType } from '@/lib/schemas';
const mailgun = new Mailgun(FormData);
const mg = mailgun.client({
    username: 'api',
    key: process.env.MAILGUN_API_KEY || 'key-yourkeyhere'
});

export async function sendWelcomeEmail(user: UserSchemaType) {
    if (!process.env.MAILGUN_API_KEY || !process.env.MAILGUN_DOMAIN) {
        throw new Error('Mailgun configuration is missing');
    }

    try {
        // Send welcome email to user
        await mg.messages.create(process.env.MAILGUN_DOMAIN, {
            from: `Hello Drew Team <noreply@${process.env.MAILGUN_DOMAIN}>`,
            to: user.email,
            subject: `🚀 You're In! Drew Joins Your Team on March 15th`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
                        .container { background-color: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                        .logo { text-align: center; margin-bottom: 30px; }
                        .logo img { max-width: 150px; height: auto; }
                        .feature { margin: 10px 0; }
                        .footer { margin-top: 30px; font-size: 12px; color: #666; text-align: center; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="logo">
                            <img src="${process.env.NEXT_PUBLIC_APP_URL}/logo-light.png" alt="SayHello Logo">
                        </div>
                        <h2>Your MVP Teammate Has Arrived</h2>
                        <p>Welcome to SayHello! You just made the smartest hire of your career, Drew, your AI-powered real estate teammate.</p>
                        
                        <p><strong>📅 March 15th:</strong> Your beta access begins.</p>
                        <p><strong>🚀 June 1st:</strong> Every game-changing feature goes live.</p>
                        
                        <p>Your 50% lifetime discount is officially locked in, no contracts, no gimmicks, just pure love. 💙 The only catch? Don't break up with Drew. As long as you stay, so does your exclusive pricing.</p>
                        
                        <h3>🔹 What Drew Can Do:</h3>
                        <div class="feature">✅ Instant Lead Response: Calls, texts, emails within seconds</div>
                        <div class="feature">✅ AI-Powered Follow-Ups: Never forgets a lead</div>
                        <div class="feature">✅ Smart Lead Qualification: Sends you only real buyers & sellers</div>
                        <div class="feature">✅ MLS & Market Insights: Knows every street, every listing</div>
                        <div class="feature">✅ Calendar Integration: Books and manages your schedule</div>
                        
                        <p>Your official welcome email will arrive soon. Get ready, real estate will never be the same.</p>
                        
                        <p>Welcome to the Drew family. 🚀</p>
                        
                        <div class="footer">
                            <p>Your SayHello Team</p>
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
            subject: `New User Signup: ${user.name}`,
            text: `A new user has signed up for Hello Drew!\n\nName: ${user.name}\nEmail: ${user.email}\nPhone: ${user.phone}\nBrokerage: ${user.brokerage_name}\nPersonal Website: ${user.personal_website}\nTeam Website: ${user.team_website}\nAmount of Leads: ${user.monthly_leads}\n\nPlease review and follow up as needed.`
        });

    } catch (error) {
        console.error('Failed to send welcome email:', error);
        throw new Error('Failed to send welcome email');
    }
}