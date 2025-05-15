import z from "zod";

export const userSchema = z.object({
  name: z.string().min(3, {
    message: "Name is required!",
  }),
  email: z.string().email(),
  phone: z.string().min(3, {
    message: "Phone number is required!",
  }),
  brokerage_name: z.string().min(3, {
    message: "Brokerage Name is required!",
  }),
  personal_website: z.string().optional(),
  team_website: z.string().optional(),
  monthly_leads: z.string().optional(),
});
export type UserSchemaType = z.infer<typeof userSchema>;

export const onboardingStep2Schema = z.object({
  name: z.string().min(3, {
    message: "Name is required!",
  }),
  email: z.string().email(),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters!",
  }),
  confirm_password: z.string().min(8, {
    message: "Password must be at least 8 characters!",
  }),
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords do not match",
  path: ["confirm_password"],
});

export type OnboardingStep2Values = z.infer<typeof onboardingStep2Schema>;

export const onboardingStep3Schema = z.object({
  name: z.string().min(3, {
    message: "Name is required!",
  }),
  email: z.string().email(),
});

export type OnboardingStep3Values = z.infer<typeof onboardingStep3Schema>;

export const onboardingStep4Schema = z.object({
  phone: z.string().min(3, {
    message: "Phone number is required!",
  }),
});

export type OnboardingStep4Values = z.infer<typeof onboardingStep4Schema>;

export const onboardingStep5Schema = z.object({
  name: z.string().optional().nullable(),
});

export type OnboardingStep5Values = z.infer<typeof onboardingStep5Schema>;


export const loginFormSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  rememberMe: z.boolean().default(false),
});
export type LoginFormValues = z.infer<typeof loginFormSchema>;