import { NextResponse, NextRequest } from "next/server";
import { db } from "@/db";
import { onboarding } from "@/db/schema/onboarding";

export async function POST(req: NextRequest) {
    try {
        const { userId } = await req.json();

        const result = await db.insert(onboarding).values({
            user_id: userId,
            current_step: 1,
            completed: false
        }).returning();

        return NextResponse.json({
            message: 'Onboarding initialized',
            onboarding: result[0]
        });

    } catch (error) {
        console.error('Onboarding initialization error:', error);
        return NextResponse.json(
            { error: 'Unable to initialize onboarding' },
            { status: 500 }
        );
    }
}