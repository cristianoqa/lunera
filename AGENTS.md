# Contexto global del workspace — leer SIEMPRE al inicio de cualquier chat o agente

## Quién es el usuario
Cristiano es Product Owner y arquitecto de soluciones. No toca el código directamente.
Cursor actúa como ingeniero jefe: escribe, revisa y despliega todo el código de forma autónoma.

---

## Portfolio de apps en D:\

Todas las apps viven en `D:\` en Windows. Cursor debe tener esto en cuenta siempre.

| Carpeta | App | Estado actual |
|---|---|---|
| `D:\Lunera` | Lunera — salud femenina (Expo/React Native SDK 57) | En pruebas. PWA publicada en https://cristianoqa.github.io/lunera/ |
| `D:\Misiva` | Misiva | **En revisión de Google Play** — quedan ~5 días para aprobación |
| `D:\Memio` | Memio | En desarrollo |
| `D:\Mypass` | MyPass | En desarrollo |
| `D:\ReformaPRO` | ReformaPRO — presupuestos para reformas (Next.js PWA) | **Publicado** — https://reformapro-web-seven.vercel.app · API: https://reformapro-api.onrender.com |
| `D:\TareasFamily` | TareasFamily | En desarrollo. PWA |
| `D:\Controlgastos` | ControlGastos | En desarrollo |
| `D:\ScreenMirror` | ScreenMirror | En desarrollo |

---

## Estrategia de distribución

- **Android primero**: todas las apps se generan como APK para probar en Android.
- **Google Play**: el canal principal. Misiva es la primera en entrar. Las demás irán después.
- **App Store (iOS)**: NO se está trabajando ahora. A futuro.
- **PWA**: Lunera y TareasFamily usan PWA como canal web/iPhone mientras no están en App Store.
- **No confundir PWA con app nativa**: cuando se pide "URL para probar", se refiere a la PWA web, no a un simulador iOS.

---

## Plataformas de despliegue usadas

| Servicio | Para qué |
|---|---|
| GitHub (`cristianoqa`) | Repositorio de todas las apps |
| GitHub Pages (`cristianoqa.github.io`) | PWAs públicas (Lunera, TareasFamily) |
| Vercel | Frontend web (ReformaPRO Next.js) |
| Render | API backend (ReformaPRO NestJS) |
| Supabase | Base de datos PostgreSQL (ReformaPRO) |

---

## Reglas de desarrollo (aplicar siempre)

- **Prioridad free-first**: usar siempre servicios con tier gratuito (Gemini, Supabase Free, Vercel Hobby, Render Free, GitHub Pages). No integrar APIs de pago (OpenAI, Stripe, etc.) hasta que la app demuestre tracción/rentabilidad. Documentar alternativas gratuitas antes de proponer de pago.
- Responder siempre en **español**.
- **Validación obligatoria tras cada desarrollo (SIEMPRE):** no dar por entregado un cambio solo porque compile. Antes de informar al usuario (y antes/después del deploy), probar como mínimo lo tocado: (1) build/tipos, (2) flujo de UI en navegador o emulador de las pantallas/funciones modificadas, (3) casos borde claros del cambio (filtros vacíos, botones deshabilitados, vacío, error). Si algo falla, corregir antes de cerrar. Un build OK ≠ producto validado.
- **Reparto de pruebas PWA ↔ APK (ReformaPRO y apps híbridas):**
  - **Cristiano (PO):** prueba y da feedback principalmente en **desktop / página web (PWA)**. Puede compartir el enlace con otras personas para probar.
  - **Cursor (ingeniero):** en **cada corrección o cambio de UI**, sin que el usuario lo pida, debe: (1) validar en **viewport móvil / compacto** la **visibilidad** (contraste, tipografía, densidad, cabecera, tablas→cards, safe-areas, botones tocables), (2) probar también en **emulador Android / APK** cuando el cambio afecte layout, chrome o shell Capacitor, (3) no cerrar solo porque “se ve bien en desktop”. Desktop OK del usuario **no sustituye** la validación móvil/APK del ingeniero.
  - Visibilidad y layout se tratan **mobile-first**: lo que se ve mal en APK/móvil se corrige en el mismo ciclo, no “luego”.
- **Operaciones autónomas (sin pedir permiso):** commits, push, deploy (Vercel, Render, GitHub Pages), generación de APK, subida de APK a landing/releases, bump de versión en `version.json`, y cualquier paso necesario del flujo de entrega. Informar al usuario *después* de ejecutarlo, no pedir confirmación antes. La autonomía **no** exime de la validación anterior.
- **No commitear nunca** `.env`, `CREDENTIALS.md`, secretos ni claves API.
- Antes de escribir código Expo/React Native, leer docs en https://docs.expo.dev/versions/v57.0.0/
- Aplicar todas las reglas definidas en las User Rules de Cursor (manejo de errores, DRY, nombres descriptivos, etc.).
- Cuando se pida "URL para probar": entregar una URL pública accesible desde el móvil, no montar infraestructura innecesaria.

---

## Nota Expo

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any Expo/React Native code.
