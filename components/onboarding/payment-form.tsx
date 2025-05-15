"use client";

import React from "react";
import Stripe from "stripe";
import {
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { useMutation } from "@tanstack/react-query";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { packages as packagesTable } from "@/db/schema/packages";
import { toast } from "sonner";
import axios from "axios";
import { users as usersTable } from "@/db/schema/users";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

async function activateUser(id: number, is_active: boolean) {
  const { data } = await axios.patch("/api/user", {
    id,
    is_active,
  });
  return data as typeof usersTable.$inferSelect;
}

interface PackageFormProps {
  package: typeof packagesTable.$inferSelect;
  user: typeof usersTable.$inferSelect;
  subscription: Stripe.Subscription & {
    latest_invoice: Stripe.Invoice & {
      payment_intent: Stripe.PaymentIntent;
    };
  };
}

export function PaymentForm({
  package: pkg,
  user,
  subscription,
}: PackageFormProps) {
  const router = useRouter();
  const stripe = useStripe();
  const elements = useElements();

  const [isLoading, setIsLoading] = React.useState(false);
  const [acceptsTerms, setAcceptsTerms] = React.useState({
    authorize_drew: false,
    not_illegal: false,
  });

  const activateUserMutation = useMutation({
    mutationFn: (payload: { is_active: boolean; id: number }) =>
      activateUser(payload.id, payload.is_active),
  });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/coming-soon?payment_status=success`,
      },
      redirect: "if_required",
    });

    if (result.error) {
      toast.error(
        result.error.message ||
          "An error occured while processing you subscription!"
      );
    }

    if (result.paymentIntent?.status === "succeeded") {
      // Payment was successful
      const userData = await activateUserMutation.mutateAsync({
        id: user.id,
        is_active: true,
      });
      if (userData) {
        localStorage.setItem("user_onboarding", JSON.stringify(userData));
        toast.success(
          "Payment Successfull. You will be redirected shortly or you can go ahead and reload page!"
        );
        const a = await axios.post("/api/onboarding/welcome", {
          email: userData.email,
        });
        console.log(a);
        router.push("/coming-soon");
      }
    }

    setIsLoading(false);
  }

  const discount = subscription.discount?.coupon.percent_off
    ? ((pkg.price / 100) * subscription.discount.coupon.percent_off) / 100
    : subscription.discount?.coupon.amount_off;
  const totalAmount = Math.max(pkg.price / 100 - (discount || 0), 0);

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <PaymentElement />

      <p className="text-lg">Order Summary</p>

      <div className="rounded-xl border p-5 text-lg mt-5">
        <div className="flex justify-between items-center border-b pb-3">
          <span>Package Name</span>
          <strong>{pkg.name}</strong>
        </div>
        <div className="flex justify-between items-center border-b py-3">
          <span>Price</span>
          <strong>${pkg.price / 100}</strong>
        </div>
        {discount && (
          <div className="flex justify-between items-center border-b py-3">
            <span>Discount</span>
            <strong>${discount.toFixed(2)}</strong>
          </div>
        )}
        <div className="flex justify-between items-center py-3">
          <span>Total Amount</span>
          <strong className="text-primary">${totalAmount.toFixed(2)}</strong>
        </div>

        <p className="text-muted-foreground">
          Your next payment will be on{" "}
          {new Date(
            new Date().setDate(new Date().getDate() + 37)
          ).toLocaleDateString()}
          .
        </p>
      </div>

      <div className="flex gap-3">
        <Checkbox
          id="authorizes"
          defaultChecked={false}
          value={String(acceptsTerms.authorize_drew)}
          onCheckedChange={(v) => {
            setAcceptsTerms({
              ...acceptsTerms,
              authorize_drew: Boolean(v),
            });
          }}
          className="mt-1"
        />
        <label
          htmlFor="authorizes"
          className="leading-tight text-muted-foreground text-lg"
        >
          I authorize HelloDrew.ai to charge my payment method on a recurring
          basis according to the terms of my subscription plan. I understand I
          can cancel anytime.
        </label>
      </div>

      <div className="flex gap-3">
        <Checkbox
          id="not-illegal"
          defaultChecked={false}
          value={String(acceptsTerms.not_illegal)}
          onCheckedChange={(v) => {
            setAcceptsTerms({
              ...acceptsTerms,
              not_illegal: Boolean(v),
            });
          }}
          className="mt-1"
        />
        <label
          htmlFor="not-illegal"
          className="leading-tight text-muted-foreground text-lg"
        >
          I promise to play by the rules, telemarketing and data privacy laws
          included. I own my actions and let Drew off the hook for any mess I
          make.
        </label>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="secondary"
          size="lg"
          disabled={
            !stripe ||
            !acceptsTerms.authorize_drew ||
            !acceptsTerms.not_illegal ||
            isLoading
          }
        >
          Try Drew for 7 Days Free{" "}
          {isLoading && <Loader2 className="animate-spin" />}
        </Button>
        <Button
          size="lg"
          disabled={
            !stripe ||
            !acceptsTerms.authorize_drew ||
            !acceptsTerms.not_illegal ||
            isLoading
          }
        >
          Get Started {isLoading && <Loader2 className="animate-spin" />}
        </Button>
      </div>

      <p className="text-muted-foreground -mt-2 leading-tight">
        The trial will be converted to the selected subscription unless canceled
        before the end of the trial period.
      </p>
    </form>
  );
}
