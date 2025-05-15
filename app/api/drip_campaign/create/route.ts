import { NextResponse, NextRequest } from 'next/server';
import axios from 'axios';
import { db } from '@/db';
import { leads } from '@/db/schema/leads';
import { eq } from 'drizzle-orm';

const WEBHOOK_URL =
  'https://services.leadconnectorhq.com/hooks/jyPDXTf3YpjI9G74bRCW/webhook-trigger/46adfe70-c715-405a-9421-ba07be3d2434';
const retellApiKey = process.env.NEXT_PUBLIC_RETELL_API_KEY;

export async function POST(req: NextRequest) {
  const body = await req.json();

  const payload = {
    inbound_dynamic_variables_webhook_url:
      'https://hook.us2.make.com/5udlpktf98lfq8my2ke6xq8ppiho4x8j',
    override_agent_id: body.override_agent_id,
    to_number: body.to_number,
    from_number: '+14244253466',
    operation: body.operation,
    workflow_status: 'active',
    retell_llm_dynamic_variables: {
      lead_name: body.lead_name, //Pass this to the AI
      lead_id: body.lead_id, //Pass this to the AI
      user_id: body.user_id.toString(), //Pass this to the AI
      brokerage_name: body.brokerage_name,
      bot_name: 'Drew',
      first_interaction: body.first_interaction,
      additional_information: body.additional_information,
    //   customInstuctions: JSON.stringify({
    //     welcome_message:
    //       "Hello, I'm Drew, your personal assistant. How are you mayowa",
    //     prompt,
    //     tone,
    //   }),
    },
  };
  console.log(payload, 'payload');
  try {
    const response = await axios.post(WEBHOOK_URL, payload, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${retellApiKey}`,
      },
    });

    // Update drip campaign status in leads table
    const updatedLead = await db
      .update(leads)
      .set({
        drip_campaign: body.operation,
        drip_campaign_status: 'active',
      })
      .where(eq(leads.id, body.lead_id));
    console.log(updatedLead, 'updatedLead');
    return NextResponse.json(response.data, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

function handleApiError(error: unknown) {
  if (axios.isAxiosError(error)) {
    switch (error.response?.status) {
      case 401:
        return NextResponse.json(
          {
            status: 'error',
            code: 'AUTH_ERROR',
            message: 'Invalid API key or authentication failed',
          },
          { status: 401 }
        );

      case 404:
        return NextResponse.json(
          {
            status: 'error',
            code: 'API_NOT_FOUND',
            message: 'API endpoint not found',
          },
          { status: 404 }
        );

      case 429:
        return NextResponse.json(
          {
            status: 'error',
            code: 'RATE_LIMIT',
            message: 'Too many requests. Please try again later.',
          },
          { status: 429 }
        );

      default:
        return NextResponse.json(
          {
            status: 'error',
            code: 'API_ERROR',
            message:
              error.response?.data?.message ||
              error.message ||
              'API request failed',
          },
          { status: error.response?.status || 500 }
        );
    }
  }

  return NextResponse.json(
    {
      status: 'error',
      code: 'UNEXPECTED_ERROR',
      message:
        error instanceof Error ? error.message : 'An unexpected error occurred',
    },
    { status: 500 }
  );
}
