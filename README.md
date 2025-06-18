# HelloDrew - AI Real Estate Assistant

HelloDrew is a comprehensive AI-powered platform designed specifically for real estate professionals to automate and enhance their client interactions, lead management, and business operations. The platform leverages artificial intelligence to handle cold calling, schedule appointments, and follow up with leads 24/7, enabling real estate agents to focus on high-value activities.

## 🚀 Features

- **AI Agents**: Create and manage custom AI agents with different voices, tones, and system prompts
- **Lead Management**: Comprehensive lead tracking, communication history, and follow-up automation
- **Appointment Scheduling**: Integration with calendar systems to automate appointment booking
- **CRM Integration**: Connect with popular CRM platforms (Hubspot, Salesforce, FollowUpBoss)
- **Voice Calling**: AI-powered voice calls using Retell's voice technology
- **Analytics Dashboard**: Track performance metrics, lead conversion rates, and call statistics
- **Contract Management**: DocuSign integration for electronic document signing
- **Team Collaboration**: Tools for team management and activity tracking
- **Onboarding Workflow**: Guided setup process for new users

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **UI Library**: React 19
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: React Query (TanStack Query)
- **Form Handling**: React Hook Form with Zod validation
- **Authentication**: NextAuth.js

### Backend
- **API Routes**: Next.js API routes
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: NextAuth.js with Google OAuth provider
- **File Storage**: Local file system

### Integrations
- **CRM Systems**: 
  - Hubspot
  - Salesforce
  - FollowUpBoss
- **Calendar**: 
  - Google Calendar
  - Calendly
- **Communication**: 
  - Twilio (SMS)
  - Retell (Voice AI)
- **Document Signing**: DocuSign
- **Payment Processing**: Stripe
- **Analytics**: Custom analytics with Recharts

### AI/ML
- **OpenAI**: For natural language processing and conversation generation
- **Retell**: For voice synthesis and real-time voice conversations

## 📊 Data Model

The application uses a comprehensive data model including:
- Users and team management
- Leads and lead conversations
- Appointments and scheduling
- AI agents configuration
- Call records and analytics
- Tasks and notifications
- Integration status tracking
- Usage limits and billing

## 🚦 Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/Hello-drew-FE.git
   cd Hello-drew-FE
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file with necessary API keys and configuration values.

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000)** with your browser to see the application.

## 🏗️ Project Structure

- `/app`: Next.js App Router pages and API routes
- `/components`: Reusable React components
- `/db`: Database schema and connection setup
- `/hooks`: Custom React hooks
- `/services`: API service functions
- `/lib`: Utility functions and constants
- `/public`: Static assets

## 📱 Key Workflows

1. **User Onboarding**:
   - Account setup
   - CRM integration
   - Calendar connection
   - Phone setup
   - Agent personality configuration

2. **Lead Management**:
   - Import leads from CRM
   - Automated follow-up sequences
   - Communication history tracking

3. **AI Agent Management**:
   - Create custom AI agents
   - Configure voice and personality
   - Set up system prompts

4. **Call Handling**:
   - AI-powered cold calling
   - Call recording and analysis
   - Follow-up task generation

5. **Appointment Booking**:
   - Automated scheduling
   - Calendar integration
   - Reminder system

## 🔒 Security

The application implements several security measures:
- JWT authentication
- Secure API routes
- Data encryption
- Role-based access control

## 📈 Performance

The application is optimized for:
- Fast page loads with Next.js
- Efficient data fetching with React Query
- Responsive design for all device sizes
- Optimized database queries

## 📄 License

This project is proprietary software.


