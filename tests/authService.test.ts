import { describe, expect, it } from "vitest";
import { createGuestProfile } from "../src/utils/authProfile";

describe("authProfile (guest mode)", () => {
  it("createGuestProfile defaults to guest auth and onboarding pending", () => {
    const profile = createGuestProfile({ id: "anon_test" });
    expect(profile.authMode).toBe("guest");
    expect(profile.onboardingCompleted).toBe(false);
    expect(profile.averageCycleLength).toBe(28);
    expect(profile.id).toBe("anon_test");
  });

  it("guest profile has no supabase uid or email hash", () => {
    const profile = createGuestProfile({ id: "anon_test" });
    expect(profile.supabaseUid).toBeUndefined();
    expect(profile.emailHash).toBeUndefined();
  });
});
