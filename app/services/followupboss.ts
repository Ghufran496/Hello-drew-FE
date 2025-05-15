import { db } from '@/db';
import { integrations } from '@/db/schema/integrations';
import { eq, and } from 'drizzle-orm';

interface FollowUpBossResponse {
  people: Array<{
    id: string;
    name: string;
    emails: Array<{value: string}>;
    phones: Array<{value: string}>;
    created: string;
    updated: string;
  }>;
}

export class FollowUpBossService {
  private baseUrl = 'https://api.followupboss.com/v1';

  async getAccessToken(userId: number): Promise<string> {
    const integration = await db.select()
      .from(integrations)
      .where(
        and(
          eq(integrations.userId, userId),
          eq(integrations.platformName, 'followupboss')
        )
      )
      .execute();

    if (!integration || integration.length === 0) {
      throw new Error('Follow Up Boss integration not found');
    }

    const credentials = integration[0].credentials as { access_token: string };
    return credentials.access_token;
  }

  async fetchLeads(userId: number): Promise<FollowUpBossResponse> {
    try {
      const accessToken = await this.getAccessToken(userId);

      const response = await fetch(`${this.baseUrl}/people`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch leads: ${response.status} - ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching leads from Follow Up Boss:', error);
      throw error;
    }
  }
}
