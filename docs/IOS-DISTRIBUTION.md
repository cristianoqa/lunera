# Lunera en iOS — Guía de distribución

Lunera ya es **Expo/React Native** con soporte iOS nativo. Desde Windows compilamos en la nube con **EAS Build** (no hace falta Mac).

## Requisitos (una sola vez)

1. **Apple Developer Program** (99 USD/año) — [developer.apple.com](https://developer.apple.com/programs/)
2. Cuenta **Expo** vinculada: `@proyectgastosapp/lunera`  
   Dashboard: https://expo.dev/accounts/proyectgastosapp/projects/lunera
3. **EAS CLI** (ya instalado): `npx eas-cli --version`

## Paso 1 — Credenciales Apple (interactivo, ~5 min)

En PowerShell, desde `D:\Lunera`:

```powershell
cd D:\Lunera
npx eas-cli build --platform ios --profile preview
```

La primera vez EAS pedirá:
- Iniciar sesión con tu **Apple ID** de desarrollador
- Crear certificado de distribución + perfil de aprovisionamiento para `com.flowhome.lunera`

> Guarda las credenciales en el servidor Expo; los siguientes builds serán automáticos.

## Paso 2 — Build iOS en la nube

```powershell
npx eas-cli build --platform ios --profile preview --non-interactive
```

Perfiles en `eas.json`:
| Perfil | Uso |
|--------|-----|
| `preview` | IPA para **TestFlight** (beta pública iOS) |
| `preview-internal` | Instalación ad-hoc (dispositivos registrados) |
| `production` | App Store final |

## Paso 3 — Subir a TestFlight

1. Crea la app en [App Store Connect](https://appstoreconnect.apple.com) → **Lunera** → bundle `com.flowhome.lunera`
2. Ejecuta:

```powershell
npx eas-cli submit --platform ios --latest
```

3. En App Store Connect → **TestFlight** → añade testers externos o activa **enlace público**
4. Copia el enlace TestFlight en `descargar-lunera-ios.html` de la landing

## Paso 4 — Landing pública

- Android: https://cristianoqa.github.io/descargar-lunera.html  
- iOS: https://cristianoqa.github.io/descargar-lunera-ios.html  

Actualiza `TESTFLIGHT_URL` en la página iOS tras el primer submit.

## Scripts npm

```bash
npm run build:ios        # build TestFlight (preview)
npm run build:ios:internal  # ad-hoc interno
npm run submit:ios       # subir último build a App Store Connect
```

## Diferencias iOS vs Android

| | Android | iOS |
|---|---------|-----|
| Beta directa | APK desde web | **TestFlight** (Apple) |
| Build local | Gradle en Windows | EAS cloud (Mac remoto) |
| Biometría | Huella | Face ID / Touch ID ✅ |
| Notificaciones | Canales Android | APNs + locales ✅ |

## Estado del proyecto

- `app.json`: `bundleIdentifier` `com.flowhome.lunera`, permisos Face ID y notificaciones
- `eas.json`: perfiles iOS configurados
- EAS Project ID: `71cbb0b8-5304-4ec5-be89-8a83c4f7de6c`

**Pendiente:** primera build interactiva para registrar credenciales Apple (bloqueo actual en Windows sin Apple ID en CI).
