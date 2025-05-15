import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const hubspotClientId = process.env.HUBSPOT_CLIENT_ID;
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/onboarding/hubspot/callback`;
    const scope = 'oauth%20crm.lists.read%20crm.lists.write%20crm.objects.appointments.read%20crm.objects.appointments.write%20crm.objects.companies.read%20crm.objects.companies.write%20crm.objects.contacts.read%20crm.objects.contacts.write%20crm.objects.deals.read%20crm.objects.deals.write%20crm.objects.leads.read%20crm.objects.leads.write%20crm.objects.listings.read%20crm.objects.listings.write%20crm.objects.users.read%20crm.objects.users.write%20crm.schemas.appointments.read%20crm.schemas.appointments.write%20crm.schemas.companies.read%20crm.schemas.companies.write%20crm.schemas.contacts.read%20crm.schemas.contacts.write%20crm.schemas.deals.read%20crm.schemas.deals.write%20crm.schemas.listings.read%20crm.schemas.listings.write';

    const authUrl = `https://app.hubspot.com/oauth/authorize?client_id=${hubspotClientId}&redirect_uri=${redirectUri}&scope=${scope}&state=${userId}`;

    return NextResponse.json({ url: authUrl });
  } catch (error) {
    console.error('Error initiating HubSpot OAuth:', error);
    return NextResponse.json({ error: 'Failed to initiate HubSpot OAuth' }, { status: 500 });
  }
} 