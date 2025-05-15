
import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia",
});

export async function POST(request: NextRequest) {
  try {
    const { price_id, customer_id, promo_code_id } = await request.json();

    const subscription = await stripe.subscriptions.create({
      customer: customer_id,
      items: [
        {
          price: price_id,
        },
      ],
      promotion_code: promo_code_id,
      payment_behavior: "default_incomplete",
      payment_settings: { save_default_payment_method: "on_subscription" },
      expand: ["latest_invoice.payment_intent"],
    });

    const latestInvoice = subscription.latest_invoice as Stripe.Invoice;
    const paymentIntent = latestInvoice.payment_intent as Stripe.PaymentIntent;

    return NextResponse.json({
      subscription,
      client_secret: paymentIntent.client_secret,
    });
  } catch {
    return NextResponse.json(
      {
        error: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
