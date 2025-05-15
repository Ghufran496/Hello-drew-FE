import { NextResponse } from 'next/server';
import { initializeScheduledFollowUps } from '@/app/services/cronService';

let isInitialized = false;

export async function GET() {
    if (!isInitialized) {
        console.log('⚡ Initializing cron jobs from API...');
        try {
            initializeScheduledFollowUps();
            isInitialized = true;
            return NextResponse.json({ message: 'Cron jobs initialized' });
        } catch (error) {
            console.error('❌ Cron initialization failed:', error);
            return NextResponse.json(
                { error: 'Failed to initialize cron jobs' },
                { status: 500 }
            );
        }
    }
    return NextResponse.json({ message: 'Cron already initialized' });
} 