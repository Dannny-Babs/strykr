import { z } from "zod";

export const signInSchema = z.object({
  email: z.email("Enter a valid email address.").transform((value) => value.trim().toLowerCase()),
  password: z.string().min(1, "Enter your password."),
});

export const signUpSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name.").max(100),
  email: z.email("Enter a valid work email.").transform((value) => value.trim().toLowerCase()),
  password: z.string().min(12, "Use at least 12 characters.").max(128).regex(/[A-Z]/, "Add an uppercase letter.").regex(/[a-z]/, "Add a lowercase letter.").regex(/[0-9]/, "Add a number."),
  accountType: z.enum(["dealer", "reviewer"]),
});

export const dealerOnboardingSchema = z.object({
  tradeName: z.string().trim().min(2, "Enter the dealership name.").max(140),
  legalName: z.string().trim().min(2, "Enter the legal business name.").max(180),
  registrationNumber: z.string().trim().min(4, "Enter the registration number.").max(40),
  city: z.string().trim().min(2, "Enter the city.").max(80),
  province: z.literal("ON"),
});

export const reviewerOnboardingSchema = z.object({
  organizationName: z.string().trim().min(2, "Enter your organization name.").max(180),
  jurisdiction: z.string().trim().min(2, "Enter the jurisdiction.").max(100),
  jobTitle: z.string().trim().min(2, "Enter your role.").max(100),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type DealerOnboardingInput = z.infer<typeof dealerOnboardingSchema>;
export type ReviewerOnboardingInput = z.infer<typeof reviewerOnboardingSchema>;
