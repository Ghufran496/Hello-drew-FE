import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req: NextRequest) {
    try {
        const {
            personId,
            assignedTo,
            assignedUserId,
            name,
            type = 'Follow Up',
            isCompleted,
            dueDate,
            dueDateTime,
            remindSecondsBefore
        } = await req.json();

        const response = await axios.post(
            'https://api.followupboss.com/v1/tasks',
            {
                personId,
                assignedTo,
                assignedUserId,
                name,
                type,
                isCompleted,
                dueDate,
                dueDateTime,
                remindSecondsBefore
            },
            {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            }
        );

        if (response.status >= 200 && response.status < 300) {
            return NextResponse.json(response.data, { status: response.status });
        } else {
            return NextResponse.json(
                { error: 'Failed to post task' },
                { status: response.status }
            );
        }
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response) {
                return NextResponse.json(
                    { error: error.response.data.message || 'Failed to post task' },
                    { status: error.response.status }
                );
            } else if (error.request) {
                return NextResponse.json(
                    { error: 'No response received from Follow Up Boss' },
                    { status: 500 }
                );
            }
        }
        console.error('Error posting task to Follow Up Boss:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
