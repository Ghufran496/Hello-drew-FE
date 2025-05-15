import { db } from "@/db";
import { packages } from "@/db/schema/packages";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!parseInt(id)) {
      return NextResponse.json(
        { error: "Invalid package id" },
        { status: 400 }
      );
    }

    const [pkg] = await db
      .select()
      .from(packages)
      .where(eq(packages.id, parseInt(id)));

    return NextResponse.json(pkg);
  } catch {
    return NextResponse.json(
      { error: "Internal Server Error!" },
      { status: 500 }
    );
  }
}
