import { NextResponse, NextRequest } from 'next/server';
import axios from 'axios';

const retellApiKey = process.env.NEXT_PUBLIC_RETELL_API_KEY;

interface RetellResponse {
  access_token: string;
  call_id: string;
}

export async function POST(req: NextRequest) {
  const { agent_id, retell_llm_dynamic_variables } = await req.json();

  if (!agent_id) {
    return NextResponse.json(
      {
        status: 'error',
        code: 'MISSING_AGENT_ID',
        message: 'Agent ID is missing',
      },
      { status: 400 }
    );
  }

  if (!retellApiKey) {
    return NextResponse.json(
      {
        status: 'error',
        code: 'MISSING_API_KEY',
        message: 'Retell API key is not configured',
      },
      { status: 500 }
    );
  }

  const payload = {
    agent_id,
    retell_llm_dynamic_variables,
  };

  const primaryEndpoint = 'https://api.retellai.com/v2/create-web-call';
  const fallbackEndpoint = 'https://api.retellai.com/create-web-call';

  async function makeApiCall(endpoint: string) {
    return axios.post<RetellResponse>(endpoint, payload, {
      headers: {
        Authorization: `Bearer ${retellApiKey}`,
        'Content-Type': 'application/json',
        ...(endpoint.includes('/v2/') && { 'X-API-Version': 'v2' }),
      },
    });
  }

  try {
    try {
      const response = await makeApiCall(primaryEndpoint);
      return NextResponse.json(
        {
          access_token: response.data.access_token,
          call_id: response.data.call_id,
        },
        { status: 200 }
      );
    } catch (primaryError) {
      if (
        axios.isAxiosError(primaryError) &&
        primaryError.response?.status === 404
      ) {
        try {
          const fallbackResponse = await makeApiCall(fallbackEndpoint);
          return NextResponse.json(
            {
              access_token: fallbackResponse.data.access_token,
              call_id: fallbackResponse.data.call_id,
            },
            { status: 200 }
          );
        } catch (fallbackError) {
          return handleApiError(fallbackError);
        }
      }
      return handleApiError(primaryError);
    }
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        code: 'UNEXPECTED_ERROR',
        message:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred',
      },
      { status: 500 }
    );
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
            message: 'Retell API endpoint not found',
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
