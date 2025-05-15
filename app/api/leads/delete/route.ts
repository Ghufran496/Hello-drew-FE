import { NextResponse } from "next/server";
import { db } from "@/db";
import { leads } from "@/db/schema/leads";
import { inArray } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const { leadIds } = await req.json();

    if (!Array.isArray(leadIds) || leadIds.length === 0) {
      return NextResponse.json(
        { error: "Invalid or empty lead IDs provided" },
        { status: 400 }
      );
    }

    // Delete leads
    await db.delete(leads).where(inArray(leads.id, leadIds));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting leads:", error);
    return NextResponse.json(
      { error: "Failed to delete leads" },
      { status: 500 }
    );
  }
}