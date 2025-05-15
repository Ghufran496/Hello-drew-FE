import { NextResponse, NextRequest } from 'next/server';
import { CalendlyService } from '@/app/services/calendly';

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId');
    if (!userId) {
      throw new Error('User ID is required');
    }
    const calendlyService = new CalendlyService();
    const authUrl = await calendlyService.getAuthUrl(userId);
    return NextResponse.json({ url: authUrl });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Failed to generate auth URL' }, { status: 500 });
  }
}
