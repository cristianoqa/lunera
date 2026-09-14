# App Store Compliance — Lunera (iOS)

**Estado:** lista para review **como app gratuita** (Fase 1) · Monetización IAP = Fase 2  
**Canal:** Expo EAS  
**Última revisión:** 14 sep 2026  
**Checklist venta:** `docs/LAUNCH_SALE_CHECKLIST.md`

## Resumen ejecutivo

| Área | Estado | Notas |
|------|--------|-------|
| Privacidad / salud | ✅ | Disclaimer + checkbox privacidad **y términos** |
| Eliminación de cuenta | ✅ | Perfil → Eliminar cuenta y datos |
| IAP / Premium | ✅ Fase 1 | “Próximamente” en iOS/Android store builds; sin compra falsa |
| Funciones útiles | ✅ | PDF/Insights libres mientras `PREMIUM_IAP_LIVE=false` |
| StoreKit / RevenueCat | ⏳ Fase 2 | Antes de cobrar Pro |
| HealthKit | ➖ N/A | No usa HealthKit |

## Checklist Apple (Guidelines)

### 2.1 — App Completeness
- [x] Build EAS iOS con `buildNumber` / autoIncrement
- [ ] Primera build TestFlight validada en dispositivo físico
- [x] Sin crashes en flujo onboarding → Main

### 2.3.1 — IAP
- [x] No hay botón de compra falsa en builds de tienda
- [ ] Integrar RevenueCat / StoreKit antes de vender Pro (`PREMIUM_IAP_LIVE=true`)

### 4.0 — Design
- [x] Safe area en WelcomeScreen
- [ ] Revisar accesibilidad VoiceOver en calendario (P2)

### 5.1.1 — Privacidad
- [x] Política + términos enlazados en onboarding
- [x] Texto “no sustituye consejo médico”
- [x] Borrado de cuenta in-app

### 5.1.2 — Datos de salud
- [x] Consentimiento explícito en onboarding
- [x] Datos locales por defecto; sync nube aplazada

## Antes de enviar a revisión (Fase 1)

1. `eas build --platform ios --profile production`
2. App Store Connect: URL privacidad `https://cristianoqa.github.io/policies/lunera-es.html`
3. Categoría: Health & Fitness
4. Screenshots iPhone 6.7" y 6.1"
5. **No** marcar IAP en la ficha hasta Fase 2

## Riesgo residual

- **Bajo** en Fase 1 (gratis + Pro próximamente).
- **Medio** si se activa cobro sin StoreKit real.
