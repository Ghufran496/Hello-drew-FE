"use client";

import React from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { ArrowRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { isValidPhoneNumber } from "react-phone-number-input";
import { toast } from "sonner";

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
import { PhoneInput } from "@/components/phone-input";
import { userSchema, type UserSchemaType } from "@/lib/schemas";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Leads,
  LeadsDialog,
} from "@/components/onboarding/monthly-leads-dialog";
import { users as usersTable } from "@/db/schema/users";

async function createUser(payload: UserSchemaType) {
  const { data } = await axios.post("/api/user", payload);
  return data as typeof usersTable.$inferSelect;
}

async function updateUser(payload: typeof usersTable.$inferInsert) {
  const { data } = await axios.patch("/api/user", payload);
  return data as typeof usersTable.$inferSelect;
}

export default function OnboardingPage() {
  const [user, setUser] = React.useState<typeof usersTable.$inferSelect | null>(
    null
  );
  const [leads, setLeads] = React.useState<Leads>();
  const router = useRouter();

  const form = useForm<UserSchemaType>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      brokerage_name: "",
      monthly_leads: undefined,
      personal_website: undefined,
      team_website: undefined,
    },
  });

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const userData = localStorage.getItem("user_onboarding");
      if (userData) {
        const parsedUser: typeof usersTable.$inferSelect = JSON.parse(userData);
        setUser(parsedUser);

        if (parsedUser.is_active) {
          router.push("/coming-soon");
        }

        // Dynamically reset the form with user data
        form.reset({
          name: parsedUser.name ?? "",
          email: parsedUser.email ?? "",
          phone: parsedUser.phone ?? "",
          brokerage_name: parsedUser.brokerage_name ?? "",
          monthly_leads: parsedUser.monthly_leads ?? undefined,
          personal_website: parsedUser.personal_website ?? undefined,
          team_website: parsedUser.team_website ?? undefined,
        });
        setLeads((parsedUser?.monthly_leads as Leads) ?? undefined);
      }
    }
  }, [form, router]);

  const [agreesTerms, setAgreesTerms] = React.useState<boolean>(
    user ? true : false
  );
  const [isLeadsOpen, setIsLeadsOpen] = React.useState<boolean>(false);

  const createUserMutation = useMutation({
    mutationFn: (payload: UserSchemaType) => createUser(payload),
    onError: (error: AxiosError) => {
      if (error.response?.status === 409) {
        toast.error("Email already registered");
      } else {
        toast.error(error.message);
      }
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: (payload: typeof usersTable.$inferInsert) =>
      updateUser(payload),
    onError: (error) => {
      toast.error(error.message);
    },
  });

  function onFormSubmit(data: UserSchemaType, e?: React.BaseSyntheticEvent) {
    e?.preventDefault();

    if (!isValidPhoneNumber(data.phone)) {
      form.setError("phone", { message: "Invalid phone number!" });
      return;
    }

    setIsLeadsOpen(true);
    router.prefetch("/welcome/plans");
  }

  async function handleSuccess() {
    if (!leads) {
      return;
    }

    const payload: UserSchemaType = {
      ...form.getValues(),
      monthly_leads: leads,
    };

    try {
      const data = user
        ? await updateUserMutation.mutateAsync({
            ...user,
            ...payload,
          })
        : await createUserMutation.mutateAsync(payload);

      if (data) {
        // Send welcome email after successful user creation
        if (!user) { // Only send for new users, not updates
          try {
            await axios.post('/api/onboarding/welcome', {
              user: data
            });
          } catch (emailError) {
            console.error('Failed to send welcome email:', emailError);
            // Don't block the flow if email fails
          }
        }
        
        localStorage.setItem("user_onboarding", JSON.stringify(data));
        router.push("/welcome/plans");
      }
    } catch (error) {
      console.error("Error during signup:", error);
      toast.error("Something went wrong during signup");
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2">
      <Form {...form}>
        <motion.form
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="pt-8 md:p-6 md:pt-6 flex items-center"
          onSubmit={form.handleSubmit(onFormSubmit)}
        >
          <div className="max-w-lg mx-auto space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="space-y-2"
            >
              <h1 className="text-xl font-medium text-colorBlue">
                Hi, I&apos;m Drew! 👋
              </h1>
              <h2 className="text-4xl font-bold text-[#171b1a]">
                Let&apos;s set you up for success.
              </h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="space-y-6"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Let&apos;s make it official. What&apos;s your name?
                    </FormLabel>
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
                    <FormLabel>
                      Where should I send your daily dose of real estate
                      brilliance?
                    </FormLabel>
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
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Phone number, please. Drew&apos;s calling magic is just one
                      step away.
                    </FormLabel>
                    <FormControl>
                      <PhoneInput defaultCountry="US" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="brokerage_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Who&apos;s your crew? Brokerage name, please!
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your current brokerage"
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
                name="personal_website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Any personal site I should bookmark for inspiration?{" "}
                      <span className="text-muted-foreground">(Optional)</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter Personal Website"
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
                name="team_website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Your team&apos;s website where should Drew look?{" "}
                      <span className="text-muted-foreground">(Optional)</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter Team Website"
                        className="w-full px-5"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <div className="flex md:items-center gap-4 md:gap-12 flex-col md:flex-row">
                  <Button
                    size="lg"
                    type="submit"
                    disabled={!agreesTerms || createUserMutation.isPending}
                  >
                    Start Setup{" "}
                    {createUserMutation.isPending ||
                    updateUserMutation.isPending ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <ArrowRight />
                    )}
                  </Button>
                  <div className="flex gap-2 -order-1 md:order-none">
                    <Checkbox
                      id="agreesTerms"
                      defaultChecked={user ? true : false}
                      value={String(agreesTerms)}
                      onCheckedChange={(v) => {
                        setAgreesTerms(Boolean(v));
                      }}
                    />
                    <label
                      htmlFor="#agreesTerms"
                      className="leading-none text-muted-foreground text-sm"
                    >
                      I agree to the Terms & Condition
                    </label>
                  </div>
                </div>

                {/* <p className="text-sm text-muted-foreground mt-3 text-center md:text-start">
                  Already know your perfect package?{" "}
                  <Link className="text-primary underline" href="#">
                    Skip this step and dive right in!
                  </Link>
                </p> */}
              </div>
            </motion.div>
          </div>
        </motion.form>
      </Form>

      <div className="hidden lg:block relative">
        <div className="h-[calc(100vh-2rem)] w-full sticky top-4">
          <Image
            src="/welcome.svg"
            alt="HelloDrew Logo"
            width={200}
            height={40}
            className="h-full w-full px-6"
          />
        </div>
      </div>

      <LeadsDialog
        leads={leads}
        onLeadsChange={setLeads}
        open={isLeadsOpen}
        onOpenChange={setIsLeadsOpen}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
