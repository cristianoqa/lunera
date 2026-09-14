# Lunera — Checklist “listo para venta”

**Fecha:** 14 sep 2026  
**Estrategia:** local-first · **sin Supabase** · monetización en 2 fases  
**Objetivo:** publicar en App Store / Play y empezar a ganar confianza (y luego dinero).

---

## Decisión de producto

| Fase | Qué | Monetización |
|------|-----|--------------|
| **Fase 1 — Ahora** | Publicar app **útil y gratuita** | Premium = “próximamente” (sin compra falsa) |
| **Fase 2 — Tras primeras reviews / tráfico** | RevenueCat + StoreKit / Play Billing | PDF + Insights avanzados + sync futura = Pro |

No pagar Supabase Pro hasta que haya ingresos o necesidad real de sync.

---

## Must (bloquean publicación / reputación)

| # | Ítem | Estado | Notas |
|---|------|--------|-------|
| M1 | Sin compra demo en builds de tienda | ✅ Hecho | Demo solo en `__DEV__`; prod = “próximamente” |
| M2 | Funciones útiles sin Pro mientras IAP no esté vivo | ✅ Hecho | PDF / Insights libres hasta `PREMIUM_IAP_LIVE` |
| M3 | Consentimiento privacidad **+ términos** en onboarding | ✅ Hecho | WelcomeScreen |
| M4 | Enlace privacidad + términos en Auth | ✅ Hecho | AuthScreen |
| M5 | Política / términos vivos en Pages | ✅ | `policies/lunera*.html` |
| M6 | Eliminar cuenta in-app | ✅ | ProfileScreen |
| M7 | Disclaimer médico onboarding | ✅ | WelcomeScreen |
| M8 | TestFlight validado en **dispositivo físico** | ⬜ Tú | Marcar tras 1 sesión real |
| M9 | App Store Connect: URL privacidad + categoría Health | ⬜ Tú | `https://cristianoqa.github.io/policies/lunera-es.html` |
| M10 | Screenshots 6.7" / 6.1" + descripción ASO | ⬜ Tú | ES mínimo; EN/PT después |
| M11 | Play Console ficha + política | ⬜ Tú | Misma URL policies |

## Should (antes de pedirle dinero a nadie)

| # | Ítem | Estado |
|---|------|--------|
| S1 | Banner Home “Lunera Pro próximamente” | ✅ Hecho |
| S2 | FAQ Premium alineada con “próximamente” | ✅ Hecho |
| S3 | Cuenta RevenueCat + apps iOS/Android | ⬜ Tú |
| S4 | Productos IAP en ASC (`lunera_pro_monthly`, `lunera_pro_yearly`) | ⬜ Tú |
| S5 | Integrar `react-native-purchases` + poner `PREMIUM_IAP_LIVE=true` | ⬜ Fase 2 |
| S6 | Restore purchases real | ⬜ Fase 2 |
| S7 | Gate PDF + Insights solo con Pro | ⬜ Fase 2 (flag) |

## Nice (post-lanzamiento)

- Sync nube (Supabase/Firebase) como entitlement Pro  
- OAuth Google/Apple  
- VoiceOver calendario  
- Upsell contextual tras N logs  

---

## 5 pantallas críticas (smoke TestFlight)

Haz esto en dispositivo **antes** de pedir review:

1. **Onboarding** — Welcome (check legal) → ciclo → goals → guest  
2. **Home** — ve fase / anillo / banner Pro  
3. **Log** — guarda síntomas del día  
4. **Calendario** — marca inicio/fin periodo  
5. **Ajustes** — export PDF (debe funcionar en Fase 1) · Perfil · borrar cuenta (probar en build de prueba)

---

## Cómo activar cobros (Fase 2) — resumen

1. Crear cuenta [RevenueCat](https://www.revenuecat.com)  
2. Productos en App Store Connect + Play Console  
3. `EXPO_PUBLIC_REVENUECAT_API_KEY_IOS` / `_ANDROID` en EAS secrets  
4. En código: `PREMIUM_IAP_LIVE = true` en `src/services/premiumGate.ts`  
5. Sustituir stub de compra en `PremiumScreen` por Purchases SDK  
6. Nueva build → TestFlight → revisión con IAP  

Hasta entonces **no** digas en la ficha “compra in-app” si no hay productos.

---

## Veredicto actual

| Pregunta | Respuesta |
|----------|-----------|
| ¿Lista para **publicar gratis**? | **Casi** — falta M8–M11 (tú en consoles) |
| ¿Lista para **cobrar Pro**? | **No** — falta Fase 2 (RevenueCat) |
| ¿Supabase? | **No** para esta salida |

Cuando marques M8–M11, Lunera puede ir a review como app gratuita Health & Fitness.
