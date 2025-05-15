"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";

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
import { onboardingStep2Schema, OnboardingStep2Values } from "@/lib/schemas";
import { useRouter } from "next/navigation";
import GoogleSignin from "@/components/onboarding/google-signin";
import { useSession } from "next-auth/react";
import { SideImage } from "@/components/onboarding/side-image";

export default function AccountSetupPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const form = useForm<OnboardingStep2Values>({
    resolver: zodResolver(onboardingStep2Schema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirm_password: "",
    },
  });

  const [showPassword, setShowPassword] = React.useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    React.useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      
      const userData = localStorage.getItem("user_onboarding");
      if (!userData) {
        router.push("/welcome");
        return;
      }
      if (status === "authenticated") {
        console.log(session);
        router.push("/welcome/verify-contact");
        return;
      }
      const parsedUser = JSON.parse(userData);
      form.setValue("name", parsedUser.name ?? "");
      form.setValue("email", parsedUser.email ?? "");
      form.setValue("password", parsedUser.password ?? "");
      form.setValue("confirm_password", parsedUser.password ?? "");
    }
  }, [form, router, status, session]);

  async function onFormSubmit(
    data: OnboardingStep2Values,
    e?: React.BaseSyntheticEvent
  ) {
    e?.preventDefault();
    // Simulate form submission
    try {
      if (status === "authenticated") {
      }

      const user = localStorage.getItem("user_onboarding");
      if (user) {
        const parsedUser = JSON.parse(user);
        parsedUser.name = data.name;
        parsedUser.email = data.email;
        parsedUser.password = data.password;
        localStorage.setItem("user_onboarding", JSON.stringify(parsedUser));
      }

      // Redirect to the next page
      router.push("/welcome/verify-contact");
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
          className="px-6 md:p-6 flex items-center"
          onSubmit={form.handleSubmit(onFormSubmit)}
        >
          <div className="max-w-lg mx-auto w-full space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="space-y-2"
            >
              <h2 className="text-4xl font-bold text-[#171b1a]">
                Account Setup
              </h2>
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
                        className="w-full px-5"
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
                        className="w-full px-5"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="Enter Password"
                          className="w-full px-5"
                          type={showPassword ? "text" : "password"}
                          {...field}
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 px-3 flex items-center"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirm_password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="Confirm Password"
                          className="w-full px-5"
                          type={showConfirmPassword ? "text" : "password"}
                          {...field}
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 px-3 flex items-center"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <div className="">
                  <Button
                    size="lg"
                    type="submit"
                    className="w-full h-12 font-bold"
                  >
                    Get Started
                  </Button>
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or
                  </span>
                </div>
              </div>
              <GoogleSignin />
            </motion.div>
          </div>
        </motion.form>
      </Form>

      <SideImage />
    </div>
  );
}
