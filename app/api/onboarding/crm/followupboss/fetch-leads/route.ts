import { NextRequest, NextResponse } from 'next/server';
import { FollowUpBossService } from '@/app/services/followupboss';

export async function POST(request: NextRequest) {
    try {
        const { userId } = await request.json();

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            );
        }

        const followUpBossService = new FollowUpBossService();
        const leads = await followUpBossService.fetchLeads(userId);

        return NextResponse.json({ leads });
    } catch (error) {
        console.error('Error in fetch-leads route:', error);
        return NextResponse.json(
            { error: 'Failed to fetch leads from Follow Up Boss' },
            { status: 500 }
        );
    }
}
