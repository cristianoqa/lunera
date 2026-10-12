# Lunera — App Store (iOS) readiness

**Bundle:** `com.flowhome.lunera`  
**Auth:** Guest local + optional email/password (Supabase). No third-party social buttons in UI.

## Guidelines

| Guideline | Status |
|-----------|--------|
| **3.1.1** | `PREMIUM_IAP_LIVE = false`. Pro features unlocked free. Premium screen = “coming soon” (no prices / no buy). |
| **4.8** | Email only in Account screen — SIWA not required. |
| Tips | About → Ko-fi / PayPal only; do not unlock Pro (`about_tip_disclaimer`). |

## Review notes (ASC)

- App works fully without an account (guest).  
- Optional account: Settings → login/register with email.  
- No active subscriptions or IAP in this build.  
- Demo: use any email/password you create in review, or stay as guest.

## Before submit

1. `eas build --platform ios --profile production` (or preview for TestFlight)  
2. Device: cycle tracking + Premium screen shows coming soon only  

## Build notes (2026-10-12)

- **TestFlight build:** 1.1.12 (33) — EAS `accd1b82-4745-40c6-a24f-47016543001e` → ASC submit `a951f551-9528-40f0-8bc1-e104bfae81eb`
- Build from **`D:\Projects\Lunera`** (real path). `D:\Lunera` is a junction; with `EAS_NO_VCS=1` the archive used `projectRootDirectory=../../Lunera` and failed with `package.json does not exist` (masked as UNKNOWN_ERROR / eas-cli#4478).
- Do **not** set `EAS_NO_VCS=1` for Lunera iOS builds.
