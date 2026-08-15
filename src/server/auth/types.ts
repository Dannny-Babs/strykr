import type { Role } from "@/domain/enums";

export type SessionUser = {
  id: string;
  organizationId: string;
  dealershipId: string | null;
  name: string;
  email: string;
  role: Role;
  onboardingComplete: boolean;
};
