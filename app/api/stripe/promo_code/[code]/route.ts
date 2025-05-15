import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia",
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    const { data: promoCodes } = await stripe.promotionCodes.list({
      code,
      active: true, // Only fetch active promo codes
    });

    if (!promoCodes || promoCodes.length === 0) {
      return NextResponse.json(
        { error: "No active promo code found." },
        { status: 404 }
      );
    }

    const promoCode = promoCodes[0];

    // Check promo code expiration
    if (promoCode.expires_at && new Date(promoCode.expires_at) < new Date()) {
      return NextResponse.json(
        { error: "Promo code has expired." },
        { status: 400 }
      );
    }

    if (promoCode.times_redeemed >= (promoCode.max_redemptions || Infinity)) {
      return NextResponse.json(
        { error: "Promo code has reached its maximum redemptions." },
        { status: 400 }
      );
    }

    const response = {
      id: promoCode.id,
      coupon_name: promoCode.coupon.name,
      code: promoCode.code,
      percent_off: promoCode.coupon.percent_off,
      amount_off: promoCode.coupon.amount_off,
      expires_at: promoCode.expires_at,
      times_redeemed: promoCode.times_redeemed,
    };

    return NextResponse.json(response);
  } catch {
    return NextResponse.json(
      {
        error: "Internal Server Error!",
      },
      { status: 500 }
    );
  }
}
