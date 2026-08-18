# Lunera — Arquitectura de producción (FemTech SaaS)

## Nombre y marca

| Campo | Valor |
|-------|--------|
| **Nombre** | **Lunera** (luna + era: ciclos, calma, confianza) |
| **Package** | `com.flowhome.lunera` |
| **Paleta** | Violeta `#7C3AED`, rosa `#F472B6`, fondo `#FAF5FF` |
| **Diferenciador vs Clue/Flo** | Cifrado cliente antes de nube, modo invitado real, sync gratis, sin vender datos |

## 1. Stack tecnológico (justificación)

| Capa | Elección | Por qué |
|------|----------|---------|
| **Mobile** | **React Native + Expo SDK 57 (TypeScript)** | Misma cadena Flow Home (Monexa, Memio): builds nativos Gradle, OTA futuro, RevenueCat, biometría, notificaciones |
| **UI** | react-native-paper + Reanimated | Material 3 premium, microinteracciones fluidas para conversión Premium |
| **Estado local** | **Zustand** + selectors | Ligero, testeable, sin boilerplate Redux |
| **Persistencia local operativa** | **AsyncStorage** | Datos de salud offline-first con modelo simple de MVP; requiere endurecimiento adicional si se quiere cifrado local total |
| **Cifrado** | **expo-crypto** (AES-GCM) + **expo-secure-store** (DEK) | Clave de datos nunca sale del dispositivo en texto plano |
| **Backend** | **Supabase** (Auth + Postgres + RLS) | Tier gratis generoso, OAuth Google/Apple, SQL relacional, MCP ya disponible |
| **Sync** | Blobs cifrados `health_vault` | El servidor solo ve `anonymous_id` + `ciphertext`; cero PII en tablas clínicas |
| **Auth social** | Supabase Auth | Email, Google, Apple nativos vía Expo |
| **Biometría** | expo-local-authentication | Face ID / Touch ID / PIN de app |
| **Gráficos** | react-native-gifted-charts | Anillos de ciclo y correlaciones síntoma-fase |
| **PDF médico** | expo-print + expo-sharing | Export Premium |
| **Monetización** | Flujo demo + stub de RevenueCat | Paywall visual listo; la compra real sigue pendiente de integración productiva |
| **Push** | expo-notifications | Recordatorios locales + programados |

**Alternativa descartada — Flutter:** excelente rendimiento, pero rompe homogeneidad del ecosistema Flow Home y duplica tooling Android/i18n.

**Alternativa descartada — Firebase Firestore:** menos control relacional para analíticas cruzadas; Supabase + RLS encaja mejor con IDs anonimizados.

## 2. Estructura de carpetas

```
D:\Lunera\
├── App.tsx
├── index.ts
├── app.json
├── docs/ARCHITECTURE.md
├── supabase/migrations/001_initial.sql
├── src/
│   ├── types/           # Modelos TS + esquemas DB
│   ├── services/        # Auth, cifrado, ciclo, sync, PDF, notificaciones
│   ├── store/           # Zustand slices
│   ├── screens/         # onboarding | auth | dashboard | log | analytics | premium | settings
│   ├── components/      # charts | cycle | ui
│   ├── navigation/      # Root, Auth, Main tabs
│   ├── hooks/
│   ├── utils/
│   ├── constants/
│   └── i18n/
└── tests/               # Vitest: predictor, auth, cifrado
```

## 3. Modelo de datos híbrido

- **Local (AsyncStorage):** colecciones serializadas para `cycles`, `daily_logs`, `user_profile`, `app_config`.
- **Nube (Supabase):** `anonymous_profiles` (UUID sin email) + `encrypted_health_blobs` (JSON cifrado).
- **Puente:** `auth.users.id` → `anonymous_profiles.supabase_uid`; datos clínicos referencian `anonymous_id`, nunca email.

## 4. Flujos críticos

1. **Invitado:** genera `local_guest_id` + DEK en SecureStore; cero red.
2. **Registro nube:** Supabase Auth → crea `anonymous_id` → sube blob cifrado.
3. **Predicción:** media móvil de últimos N ciclos → 4 fases + ventana fértil.
4. **Premium:** el entitlement `premium` está representado a nivel de producto/UI; la compra real sigue en modo stub/demo.

## 5. Roadmap inmediato (post pasos 1–4)

- Módulos A–G en pantallas
- Migraciones Supabase + RLS
- QA emulador + tests E2E manuales
- Build release y endurecimiento clínico/privacidad previo a publicación
