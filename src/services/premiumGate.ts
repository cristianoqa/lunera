/**
 * Gate de Premium.
 * Mientras IAP no esté vivo en tiendas, las funciones “Pro” siguen libres
 * para no bloquear una app útil en App Store / Play.
 * Fase 2: poner PREMIUM_IAP_LIVE = true + RevenueCat.
 */
export const PREMIUM_IAP_LIVE = false;

export function hasPremiumAccess(premiumActive: boolean | undefined | null): boolean {
  if (!PREMIUM_IAP_LIVE) return true;
  return Boolean(premiumActive);
}

export function showPremiumComingSoon(): boolean {
  return !PREMIUM_IAP_LIVE;
}
