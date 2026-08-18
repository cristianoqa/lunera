import type { UserGoal, UserProfile } from "../types/user";

export function createGuestProfile(partial?: Partial<UserProfile>): UserProfile {
  const now = new Date().toISOString();
  return {
    id: partial?.id ?? "",
    authMode: "guest",
    goals: partial?.goals ?? [],
    lastPeriodStart: partial?.lastPeriodStart ?? null,
    averageCycleLength: partial?.averageCycleLength ?? 28,
    averagePeriodLength: partial?.averagePeriodLength ?? 5,
    onboardingCompleted: partial?.onboardingCompleted ?? false,
    createdAt: partial?.createdAt ?? now,
    updatedAt: now,
  };
}

export function applyOnboarding(
  profile: UserProfile,
  input: {
    lastPeriodStart: string;
    averageCycleLength: number;
    averagePeriodLength: number;
    goals: UserGoal[];
  }
): UserProfile {
  return {
    ...profile,
    ...input,
    onboardingCompleted: true,
    updatedAt: new Date().toISOString(),
  };
}
