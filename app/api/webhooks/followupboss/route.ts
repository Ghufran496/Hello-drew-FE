// TO Delete Webhook

// import { NextRequest, NextResponse } from 'next/server';

// export async function DELETE(req: NextRequest) {
//     try {
//         const { apiKey, webhookId } = await req.json();

//         if (!apiKey || !webhookId) {
//             return NextResponse.json(
//                 { error: 'API key and webhook ID are required' },
//                 { status: 400 }
//             );
//         }

//         // Base64 encode the API key
//         const encodedApiKey = Buffer.from(apiKey).toString('base64');

//         const response = await fetch(`https://api.followupboss.com/v1/webhooks/${webhookId}`, {
//             method: 'DELETE',
//             headers: {
//                 'accept': 'application/json',
//                 'Authorization': `Basic ${encodedApiKey}`,
//                 'content-type': 'application/json',
//                 'system': 'hellodrew',
//                 'X-System': 'hellodrew' // Added both header variations to handle potential requirements
//             }
//         });

//         if (!response.ok) {
//             const errorData = await response.json();
//             throw new Error(errorData.error || errorData.errorMessage || 'Failed to delete webhook');
//         }

//         return NextResponse.json({
//             message: 'Webhook deleted successfully'
//         });

//     } catch (error) {
//         console.error('Error deleting Follow Up Boss webhook:', error);
//         return NextResponse.json(
//             { error: 'Failed to delete webhook' },
//             { status: 500 }
//         );
//     }
// }

// to register webhook

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const { apiKey } = await req.json();

        if (!apiKey) {
            return NextResponse.json(
                { error: 'API key is required' },
                { status: 400 }
            );
        }

        // Base64 encode the API key
        const encodedApiKey = Buffer.from(apiKey).toString('base64');

        // Create webhook directly without validation
        const webhookUrl = new URL('/api/webhooks/followupboss/receive-updates', process.env.NEXT_PUBLIC_APP_URL).toString();
        
        try {
            const response = await fetch('https://api.followupboss.com/v1/webhooks', {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'content-type': 'application/json',
                    'Authorization': `Basic ${encodedApiKey}`
                },
                body: JSON.stringify({
                    url: webhookUrl,
                    system: 'hellodrew',
                    event: 'peopleUpdated',
                    // Removed the 'format' field
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.errorMessage || 'Failed to create webhook');
            }

            return NextResponse.json({
                message: 'Webhook created successfully',
                data
            });
        } catch (error) {
            console.error('Follow Up Boss API Error:', error);
            return NextResponse.json(
                { 
                    error: 'Webhook creation failed',
                    details: error instanceof Error ? error.message : 'Unknown error'
                },
                { status: 500 }
            );
        }

    } catch (error) {
        console.error('Server Error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
// to get webhook

// import { NextRequest, NextResponse } from 'next/server';

// export async function GET(request: NextRequest) {
//     console.log('Incoming GET request:', request);
//     try {
//         const apiKey = process.env.FOLLOWUP_BOSS_API_KEY;
//         if (!apiKey) {
//             throw new Error('FOLLOWUP_BOSS_API_KEY is not set');
//         }

//         const encodedApiKey = Buffer.from(apiKey).toString('base64');

//         // Include the 'system' parameter in the URL
//         const url = new URL('https://api.followupboss.com/v1/webhooks');
//         url.searchParams.append('system', 'hellodrew'); // Replace 'hellodrew' with your actual system name if different

//         const response = await fetch(url, {
//             method: 'GET',
//             headers: {
//                 'Accept': 'application/json',
//                 'Authorization': `Basic ${encodedApiKey}`
//             }
//         });

//         const data = await response.json();

//         if (!response.ok) {
//             throw new Error(data.errorMessage || `Failed to fetch webhooks: ${response.statusText}`);
//         }

//         return NextResponse.json({
//             message: 'Webhooks fetched successfully',
//             data
//         });

//     } catch (error) {
//         console.error('Error fetching webhooks:', error);
//         return NextResponse.json(
//             { 
//                 error: 'Failed to fetch webhooks',
//                 details: error instanceof Error ? error.message : 'Unknown error'
//             },
//             { status: error instanceof Error && error.message.includes('is not set') ? 400 : 500 }
//         );
//     }
// }

// to update webhook

// import { NextRequest, NextResponse } from 'next/server';


// export async function PUT(request: NextRequest) {
//     console.log('Incoming PUT request:', request);
//     try {
//         const apiKey = process.env.FOLLOWUP_BOSS_API_KEY;
//         if (!apiKey) {
//             throw new Error('FOLLOWUP_BOSS_API_KEY is not set');
//         }

//         const encodedApiKey = Buffer.from(apiKey).toString('base64');
//         const { id } = await request.json();

//         const options = {
//             method: 'PUT',
//             headers: {
//                 'accept': 'application/json',
//                 'content-type': 'application/json',
//                 'Authorization': `Basic ${encodedApiKey}`
//             },
//             body: JSON.stringify({
//                 status: 'active',
//                 event: 'peopleCreated',
//                 system: 'hellodrew' // Include system in the request body
//             })
//         };

//         const response = await fetch(`https://api.followupboss.com/v1/webhooks/${id}`, options);
//         const data = await response.json();

//         if (!response.ok) {
//             throw new Error(data.errorMessage || `Failed to update webhook: ${response.statusText}`);
//         }

//         return NextResponse.json({
//             message: 'Webhook updated successfully',
//             data
//         });

//     } catch (error) {
//         console.error('Error updating webhook:', error);
//         return NextResponse.json(
//             { 
//                 error: 'Failed to update webhook',
//                 details: error instanceof Error ? error.message : 'Unknown error'
//             },
//             { status: error instanceof Error && error.message.includes('is not set') ? 400 : 500 }
//         );
//     }
// }


