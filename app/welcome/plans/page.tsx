"use client";

import React from "react";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AlertCircle, ArrowLeft, Loader2 } from "lucide-react";

import { PackageCard } from "@/components/onboarding/package-card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PackageSkeleton } from "@/components/onboarding/package-skeleton";
import { packages as packagesTable } from "@/db/schema/packages";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { users as usersTable } from "@/db/schema/users";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const customPackage = {
  buttonLabel: "Ready for some Action!",
  features: [
    "Fully customizable plans for large teams and brokerages.",
    "Features include: Flexible Calls, Texts, Emails, Branding Options, and Dedicated Training.",
  ],
  name: "Custom Team",
};

type PackageType = typeof packagesTable.$inferSelect;
type PromoCodeType = {
  id: string;
  coupon_name: string | null;
  code: string;
  percent_off: number | null;
  amount_off: number | null;
  expires_at: number | null;
  times_redeemed: number;
};

async function getPackages() {
  const { data } = await axios.get("/api/packages");
  return data as PackageType[];
}

async function getPromoCode(code: string) {
  const { data } = await axios.get(`/api/stripe/promo_code/${code}`);
  return data as PromoCodeType;
}

async function updateUserWithPackage(payload: {
  id: number;
  package_id: number;
}) {
  const { data } = await axios.patch("/api/user", payload);
  return data as typeof usersTable.$inferSelect;
}

export default function PlansPage() {
  const [user, setUser] = React.useState<typeof usersTable.$inferSelect | null>(
    null
  );

  const router = useRouter();

  const [selectedPackage, setSelectedPackage] =
    React.useState<PackageType | null>(null);
  const [promoCode, setPromoCode] = React.useState<PromoCodeType>();
  const [code, setCode] = React.useState<string>("");
  const [isPromoLoading, setIsPromoLoading] = React.useState<boolean>(false);
  const [discountAmount, setDiscountAmount] = React.useState<number>();

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const userData = localStorage.getItem("user_onboarding");
      if (userData) {
        setUser(JSON.parse(userData));
      } else {
        router.push("/welcome");
      }
    }
  }, [router]);

  const packages = useQuery({
    queryFn: () => getPackages(),
    queryKey: ["packages"],
    refetchOnWindowFocus: false,
  });

  const updateUserMutation = useMutation({
    mutationFn: (payload: { id: number; package_id: number }) =>
      updateUserWithPackage(payload),
    onError: () => {
      toast.error("Error selecting package! Please try again later.");
    },
  });

  React.useEffect(() => {
    if (!packages.data) {
      return;
    }

    if (user?.package_id) {
      console.log(user);
      setSelectedPackage(
        packages.data.find((pkg) => pkg.id === user.package_id) ||
          packages.data[0]
      );
    } else {
      setSelectedPackage(packages.data[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [packages.data]);

  const types = React.useMemo(() => {
    if (packages.data) {
      return [...new Set(packages.data.map((pkg) => pkg.type))];
    }
  }, [packages.data]);

  async function handleNext() {
    if (!selectedPackage || !user) {
      return;
    }

    if (user.package_id !== selectedPackage.id) {
      const updatedUser = await updateUserMutation.mutateAsync({
        id: user.id,
        package_id: selectedPackage.id,
      });

      if (updatedUser) {
        localStorage.setItem("user_onboarding", JSON.stringify(updatedUser));
      }
    }
    if (promoCode) {
      const searchParams = new URLSearchParams();
      searchParams.set("promo_code_id", promoCode.id);
      router.push(`/welcome/payment?${searchParams.toString()}`);
    } else {
      router.push("/welcome/payment");
    }
  }

  async function handleApplyPromoCode(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPromoLoading(true);
    if (!code) {
      return;
    }
    const promoData = await getPromoCode(code).catch((error) => {
      toast.error(
        error.response.data.error
          ? error.response.data.error
          : "Something went wrong"
      );
      setIsPromoLoading(false);
    });
    if (promoData) {
      setPromoCode(promoData);
      if (!selectedPackage) return;
      const discountValue = promoData.percent_off
        ? ((selectedPackage.price / 100) * promoData.percent_off) / 100
        : promoData.amount_off;
      setDiscountAmount(discountValue ?? undefined);
    }
    setIsPromoLoading(false);
  }

  const totalAmount = React.useMemo(() => {
    if (!selectedPackage) return 0;
    if (!discountAmount) return selectedPackage.price / 100;
    const total = selectedPackage.price / 100 - discountAmount;
    if (total < 0) return 0;
    return total;
  }, [discountAmount, selectedPackage]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10 container mx-auto relative">
      <div className="flex flex-col">
        <Button asChild className="[&_svg]:size-6" variant="ghost" size="icon">
          <Link href="/welcome">
            <ArrowLeft />
          </Link>
        </Button>

        <h1 className="text-4xl font-bold mt-5">Your Perfect Package</h1>

        <p className="my-5 text-lg">
          Based on your input, this plan is a perfect match.
        </p>

        {packages.isLoading ? (
          <PackageSkeleton />
        ) : packages.isError ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No Packages found at the moment!</AlertTitle>
            <AlertDescription>
              There was an error loading packages. Please try again later.
            </AlertDescription>
          </Alert>
        ) : (
          selectedPackage && (
            <>
              <PackageCard {...selectedPackage} />
              <form className="space-y-2 mt-4" onSubmit={handleApplyPromoCode}>
                <Label htmlFor="promo-code">Promo Code</Label>
                <div className="relative">
                  <Input
                    className="w-full pr-24"
                    placeholder="Input promo code"
                    onChange={(e) => setCode(e.target.value)}
                    value={code}
                  />
                  <Button
                    className="px-6 absolute right-1.5 top-1/2 -translate-y-1/2"
                    disabled={
                      !code || isPromoLoading || code === promoCode?.code
                    }
                  >
                    Apply
                    {isPromoLoading && <Loader2 className="animate-spin" />}
                  </Button>
                </div>
              </form>
              <div className="rounded-xl border p-5 text-lg mt-5">
                <div className="flex justify-between items-center border-b pb-3">
                  <span>Package Name</span>
                  <strong>{selectedPackage.name}</strong>
                </div>
                <div className="flex justify-between items-center border-b py-3">
                  <span>Price</span>
                  <strong>${selectedPackage.price / 100}</strong>
                </div>
                {discountAmount && (
                  <div className="flex justify-between items-center border-b py-3">
                    <span>Discount</span>
                    <strong>${discountAmount.toFixed(2)}</strong>
                  </div>
                )}
                <div className="flex justify-between items-center py-3">
                  <span>Total Amount</span>
                  <strong className="text-primary">
                    ${totalAmount.toFixed(2)}
                  </strong>
                </div>
                <p className="text-muted-foreground">
                  Your next payment will be on{" "}
                  {new Date(
                    new Date().setDate(new Date().getDate() + 37)
                  ).toLocaleDateString()}
                  .
                </p>
              </div>
              <Button
                className="block mt-5 lg:mb-10 ml-auto"
                variant="secondary"
                size="lg"
                onClick={handleNext}
              >
                Next (Lock it In)
              </Button>
            </>
          )
        )}
      </div>

      <div className="sticky top-4 h-fit">
        <ScrollArea className="lg:h-[calc(100vh-2rem)] bg-muted rounded-3xl p-8">
          {packages.isLoading ? (
            <div className="space-y-5">
              <PackageSkeleton />
              <PackageSkeleton />
              <PackageSkeleton />
            </div>
          ) : (
            packages.data &&
            types && (
              <Tabs defaultValue={types[0]}>
                <TabsList className="h-fit w-full flex max-w-xs mx-auto mb-5">
                  {types.map((type) => (
                    <TabsTrigger
                      key={type}
                      className="text-lg py-3 w-full capitalize"
                      value={type}
                    >
                      {type}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {types.map((type) => (
                  <TabsContent key={type} className="space-y-5" value={type}>
                    {packages.data
                      .filter((pkg) => pkg.type === type)
                      .map((pkg) => (
                        <PackageCard
                          key={pkg.id}
                          className={
                            selectedPackage?.id === pkg.id
                              ? "border-2 border-primary"
                              : undefined
                          }
                          onSelect={() => {
                            setSelectedPackage(pkg);
                          }}
                          {...pkg}
                        />
                      ))}
                    {type === "team" && (
                      <PackageCard {...customPackage} onSelect={() => {}} />
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            )
          )}
        </ScrollArea>
      </div>
    </div>
  );
}
