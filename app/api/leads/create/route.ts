import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { leads } from "@/db/schema/leads";
import { leadConversation } from "@/db/schema/lead_conversation";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, name, email, phone, status, source, stage } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const [newLead] = await db
      .insert(leads)
      .values({
        user_id: userId,
        name,
        email,
        phone,
        status,
        source,
        lead_details: {
          stage: stage || "Lead",
        },
        created_at: new Date(),
        updated_at: new Date(),
      })
      .returning();

    // TODO: Send email with text: Hi [Lead’s Name], this is [Agent Name] with [Brokerage Name]. I saw you were interested in [property address/area]. Are you currently looking to buy/sell a home?
    await db
      .insert(leadConversation)
      .values({
        lead_id: newLead.id,
        send_by: "assistant",
        message_type: "Initial-Outreach",
        message_text: `Hi ${newLead.name}, this is [Agent Name] with [Brokerage Name]. I saw you were interested in [property address/area]. Are you currently looking to buy/sell a home?`,
      })
      .returning();

    return NextResponse.json({
      message: "Lead created successfully",
      lead: newLead,
    });
  } catch (error) {
    console.error("Error creating lead:", error);
    return NextResponse.json(
      { error: "Failed to create lead" },
      { status: 500 }
    );
  }
}
