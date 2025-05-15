"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  onboardingStep3Schema,
  OnboardingStep3Values,
} from "@/lib/schemas";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useProgress } from "@/app/context/ProgressContext";
import ProgressBar from "@/components/onboarding/progressBar";
import { useSession } from "next-auth/react"
import { toast } from "sonner";
import { SideImage } from "@/components/onboarding/side-image";

export default function VerifyContactPage() {
  const { data: session, status } = useSession()

  const router = useRouter();
  const { step, progress, setProgress, setStep } = useProgress();
  const [isLoading, setIsLoading] = React.useState(false);
  const form = useForm<OnboardingStep3Values>({
    resolver: zodResolver(onboardingStep3Schema),
    defaultValues: {
      name: "",
      email: "",
    },
  });

  useEffect(() => {
    if (status === "authenticated") {
      const info_updated = localStorage.getItem("info_updated");
      if (info_updated) {
        const parsedInfo = JSON.parse(info_updated);
        parsedInfo.name = session?.user?.name ?? "";
        parsedInfo.email = session?.user?.email ?? "";
        form.setValue("name", parsedInfo.name ?? "");
        form.setValue("email", parsedInfo.email ?? "");
        
      }
      else {
        form.setValue("name", session?.user?.name ?? "");
        form.setValue("email", session?.user?.email ?? "");
      }
    }
  }, [status, session, form]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userData = localStorage.getItem("user_onboarding");
      if (!userData) {
        router.push("/welcome");
        return;
      }

      const parsedUser = JSON.parse(userData);
      form.setValue("name", parsedUser.name ?? "");
      form.setValue("email", parsedUser.email ?? "");
    }
  }, [form, router]);

  useEffect(() => {
    setProgress(16 * 1);
    setStep(1);
  }, [setProgress, setStep]);

  async function onFormSubmit(data: OnboardingStep3Values, e?: React.BaseSyntheticEvent) {
    e?.preventDefault();
    // Simulate form submission
    try {
      const user = localStorage.getItem("user_onboarding");
      if (user) {
        const parsedUser = JSON.parse(user);
        parsedUser.name = data.name;
        parsedUser.email = data.email;
        localStorage.setItem("user_onboarding", JSON.stringify(parsedUser));
        
      }
      if (status === "authenticated" && (form.getValues("name") !== session?.user?.name || form.getValues("email") !== session?.user?.email)) {
        const info_updated = {
          name: form.getValues("name"),
          email: form.getValues("email"),
        };
        localStorage.setItem('info_updated', JSON.stringify(info_updated));
        
      }
      if (user) {
        const parsedUser = JSON.parse(user);
        try {
          setIsLoading(true);
          const response = await fetch('/api/auth/signup', {
            method: 'POST',
            body: JSON.stringify({
          id: parsedUser?.id,
          email: data.email,
        }),
        });
        const result = await response.json();
        console.log(result);
        if (result.message === 'Please check your email to verify your account.') {
          toast.success('Verification Link sent to your email!');
          router.push("/welcome/setup-phone");
        }
        if (result.error) {
          toast.error(result.error);
        }
        } catch (error) {
          console.error("Error verifying email:", error);
        }
        setIsLoading(false);
      }
      console.log("Form submitted successfully:", data);
    
      
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
                  <Link href="/welcome/account-setup">
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
                  Verify Contact Info
                </h3>
                <p className="text-sm text-muted-foreground">
                  Double-check these details—Drew’s only as good as the info you give!
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
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your name"
                        className="w-full px-5 "
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your email"
                        className="w-full px-5 "
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <div className="">
                  <Button size="lg" type="submit" disabled={isLoading} className="font-bold py-2 px-20">
                    Next
                    {isLoading && <Loader2 className="animate-spin" />}
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
