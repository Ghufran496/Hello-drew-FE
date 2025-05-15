"use client";

import React, { Suspense } from "react";
import Stripe from "stripe";
import Link from "next/link";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PaymentForm } from "@/components/onboarding/payment-form";
import { users as usersTable } from "@/db/schema/users";
import { packages as packagesTable } from "@/db/schema/packages";
import { Skeleton } from "@/components/ui/skeleton";
import { SideImage } from "@/components/onboarding/side-image";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

async function getSubscriptionPaymentIntent(payload: {
  customer_id: string;
  price_id: string;
  promo_code_id?: string;
}) {
  const { data } = await axios.post("/api/stripe/create_subscription", payload);
  return data as {
    client_secret: string;
    subscription: Stripe.Subscription & {
      latest_invoice: Stripe.Invoice & {
        payment_intent: Stripe.PaymentIntent;
      };
    };
  };
}

async function getPackage(package_id: number) {
  const { data } = await axios.get(`/api/packages/${package_id}`);
  return data as typeof packagesTable.$inferSelect;
}

export default function PaymentPage() {
  const [user, setUser] = React.useState<typeof usersTable.$inferSelect | null>(
    null
  );

  const router = useRouter();

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const userString = localStorage.getItem("user_onboarding");

    if (!userString) {
      router.push("/welcome");
      return;
    }

    try {
      const userData = JSON.parse(userString);

      if (!userData || !userData.package_id) {
        router.push(userData ? "/welcome/plans" : "/welcome");
        return;
      }

      if (userData.is_active) {
        router.push("/coming-soon");
        return;
      }

      setUser(userData);
    } catch {
      router.push("/welcome");
    }
  }, [router]);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentPageContent user={user} />
    </Suspense>
  );
}

function PaymentPageContent({ user }: { user: typeof usersTable.$inferSelect | null }) {
  const searchParams = useSearchParams();

  const packageQuery = useQuery({
    queryFn: () => getPackage(user?.package_id as number),
    queryKey: ["package", user?.package_id],
    enabled: !!user?.package_id,
    refetchOnWindowFocus: false,
  });

  const clientSecretQuery = useQuery({
    queryFn: () =>
      getSubscriptionPaymentIntent({
        customer_id: user?.customer_id || "",
        price_id: packageQuery.data?.price_id as string,
        promo_code_id: searchParams.get("promo_code_id") ?? undefined,
      }),
    queryKey: ["clientSecret", user?.customer_id, packageQuery.data?.price_id],
    enabled: !!user?.customer_id && !!packageQuery.data,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retry: false,
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10 container mx-auto">
      <div className="flex flex-col w-full max-w-xl mx-auto pb-8">
        <Button asChild className="[&_svg]:size-6" variant="ghost" size="icon">
          <Link href="/welcome/plans">
            <ArrowLeft />
          </Link>
        </Button>

        <h1 className="text-4xl font-bold mt-5">Ready, Set, Drew.</h1>

        <p className="mt-5 text-lg">
          You’re all set! Drew can’t wait to impress your clients.
        </p>

        <div className="mt-3 mb-6 rounded-xl border p-5 text-lg">
          {packageQuery.isLoading ? (
            <>
              <Skeleton className="h-6 w-full my-4" />
              <Skeleton className="h-6 w-full my-4" />
              <Skeleton className="h-6 w-full my-4" />
            </>
          ) : (
            packageQuery.data && (
              <>
                <div className="flex justify-between items-center border-b pb-3">
                  <span>Package Name</span>
                  <strong>{packageQuery.data.name}</strong>
                </div>
                <div className="flex justify-between items-center border-b py-3">
                  <span>Price</span>
                  <strong>${packageQuery.data.price / 100}</strong>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span>Billing Frequency</span>
                  <strong>Billed Monthly</strong>
                </div>

                <Link
                  href="/welcome/plans"
                  className="text-primary hover:underline flex items-center gap-2"
                >
                  Change Frequency <ArrowRight size={16} />
                </Link>
              </>
            )
          )}
        </div>

        {clientSecretQuery.isPending ? (
          <div className="flex flex-col">
            <Skeleton className="h-6 w-full my-2" />
            <Skeleton className="h-6 w-full my-2" />
            <Skeleton className="h-6 w-full my-2" />
          </div>
        ) : clientSecretQuery.isError ? (
          <div className="mt-8">
            <p className="text-destructive text-center">
              Error generating invoice. Please try again later.
            </p>
          </div>
        ) : (
          clientSecretQuery.data?.client_secret && (
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret: clientSecretQuery.data.client_secret,
                appearance: {
                  theme: "stripe",
                  variables: {
                    fontSizeBase: "18px",
                    colorPrimary: "#0357F8",
                    borderRadius: "24px",
                  },
                  rules: {
                    ".Input": {
                      padding: "10px 16px",
                      fontSize: "16px",
                      backgroundColor: "#FCFCFD",
                      borderColor: "#DFDFDF",
                    },
                    ".Label": {
                      fontSize: "18px",
                      color: "#0F1925",
                      marginBottom: "8px",
                    },
                  },
                },
              }}
            >
              <PaymentForm
                package={packageQuery.data!}
                user={user!}
                subscription={clientSecretQuery.data.subscription}
              />
            </Elements>
          )
        )}
      </div>

      <SideImage />
    </div>
  );
}
