import { NextResponse } from "next/server";
import { db } from "@/db";
import { packages } from "@/db/schema/packages";

export async function GET() {
  try {
    const pacakagesList = await db.select().from(packages);

    return NextResponse.json(pacakagesList);
  } catch {
    return NextResponse.json(
      {
        error: "Error fetching packages",
      },
      { status: 500 }
    );
  }
}
