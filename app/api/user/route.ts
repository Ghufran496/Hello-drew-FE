import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { userSchema } from "@/lib/schemas";
import { users } from "@/db/schema/users";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia",
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: "Email parameter is required" }, { status: 400 });
    }

    // Check if user exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1)
      .then(rows => rows[0]);

    if (!existingUser) {
      // Create new user with Stripe customer
      const customer = await stripe.customers.create({
        email: email,
        name: email.split('@')[0] // Use email prefix as name temporarily
      });

      const [newUser] = await db
        .insert(users)
        .values({
          email: email,
          name: email.split('@')[0],
          is_verified: true,
          is_active: false,
          role: 'user',
          customer_id: customer.id,
          phone: '',
          brokerage_name: '',
        })
        .returning();

      return NextResponse.json(newUser);
    }

    return NextResponse.json(existingUser);
  } catch (error) {
    console.error("Error in user API:", error);
    return NextResponse.json({ error: "Failed to process user" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userBody = userSchema.parse(await req.json());

    const customer = await stripe.customers.create({
      email: userBody.email,
      name: userBody.name,
    });
    const [user] = await db
      .insert(users)
      .values({
        ...userBody,
        customer_id: customer.id,
      })
      .returning();

    return NextResponse.json(user);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Validation Error",
          details: error.errors,
        },
        { status: 400 }
      );
    } else if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        {
          error: "Stripe Error",
          message: error.message,
        },
        { status: 500 }
      );
    } else if (error instanceof Error && error.message.includes("duplicate key value")) {
      return NextResponse.json(
        {
          error: "Validation Error",
          message: "Email already registered",
        },
        { status: 409 }
      );
    } else {
      return NextResponse.json(
        {
          error: "Internal Server Error",
          message: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 }
      );
    }
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      id,
      package_id,
      name,
      email,
      password,
      phone,
      brokerage_name,
      personal_website,
      team_website,
      monthly_leads,
      is_active,
      is_verified,
      role,
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Validation Error", message: "ID is required" }, 
        { status: 400 }
      );
    }

    // Create an update object with only defined values
    const updateData: Record<string, string | number | boolean> = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (password !== undefined) updateData.password = password;
    if (brokerage_name !== undefined) updateData.brokerage_name = brokerage_name;
    if (personal_website !== undefined) updateData.personal_website = personal_website;
    if (monthly_leads !== undefined) updateData.monthly_leads = monthly_leads;
    if (team_website !== undefined) updateData.team_website = team_website;
    if (is_active !== undefined) updateData.is_active = is_active;
    if (is_verified !== undefined) updateData.is_verified = is_verified;
    if (role !== undefined) updateData.role = role;
    if (package_id !== undefined) updateData.package_id = package_id;

    // Log the update operation for debugging
    console.log('Updating user with ID:', id);
    console.log('Update data:', updateData);

    const [user] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();

    return NextResponse.json(user);
  } catch (error) {
    console.error('PATCH error details:', error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: error instanceof Error ? error.message : "Unknown error",
        details: error
      },
      { status: 500 }
    );
  }
}
