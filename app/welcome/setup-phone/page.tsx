"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import {  ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  onboardingStep4Schema,
  OnboardingStep4Values,
} from "@/lib/schemas";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ProgressBar from "@/components/onboarding/progressBar";
import { useProgress } from "@/app/context/ProgressContext";
import { PhoneInput } from "@/components/phone-input";
import { SideImage } from "@/components/onboarding/side-image";
export default function AccountSetupPage() {
  const router = useRouter();
  const { progress, setProgress, step, setStep } = useProgress();
  const form = useForm<OnboardingStep4Values>({
    resolver: zodResolver(onboardingStep4Schema),
    defaultValues: {
      phone: "",
    },
  });
  useEffect(() => {
    if (typeof window !== "undefined") {
      const userData = localStorage.getItem("user_onboarding");
      if (!userData) {
        router.push("/welcome");
        return;
      }
      const parsedUser = JSON.parse(userData);
      form.setValue("phone", parsedUser.phone ?? "");
    }
  }, [form, router]);

  setProgress(16 * 2);
  setStep(2);
  async function onFormSubmit(data: OnboardingStep4Values, e?: React.BaseSyntheticEvent) {
    e?.preventDefault();
    try {
      console.log("Form submitted successfully:", data);

      const user = localStorage.getItem("user_onboarding");
      if (user) {
        const parsedUser = JSON.parse(user);
        parsedUser.phone = data.phone;
        localStorage.setItem("user_onboarding", JSON.stringify(parsedUser));
      }

      router.push("/welcome/availability-settings");
    } catch (error) {
      console.error("Form submission error:", error);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2">
      <Form {...form}>
        <motion.form
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="px-6 md:p-6 flex "
          onSubmit={form.handleSubmit(onFormSubmit)}
        >
          <div className="max-w-lg mx-auto w-full py-8 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="space-y-2"
            >
              <div className="py-4 flex items-center space-x-2">
              <Button  asChild className="[&_svg]:size-6" variant="ghost" size="icon">
                  <Link href="/welcome/verify-contact">
                    <ArrowLeft />
                  </Link>
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <h2 className="text-4xl font-bold text-[#171b1a]">
                  Let’s Get You Ready
                </h2>
                <p className="text-lg">
                  {step}/6
                </p>
              </div>

              <ProgressBar progress={progress} />

              <div className="flex flex-col gap-1">
                <h3 className="text-xl font-medium">
                Set Up Phone Number
                </h3>
                <p className="text-sm text-muted-foreground">
                Drew’s ready to text and call. Verify your number and let’s roll!
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="space-y-6 "
            >
               <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                    Phone Number
                    </FormLabel>
                    <FormControl>
                      <PhoneInput className=" rounded-full"  defaultCountry="US" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              

              <div>
                <div className="">
                  <Button size="lg" type="submit" className="font-bold py-2 px-20">
                    Next
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.form>
      </Form>

      <SideImage />
    </div>
  );
}
