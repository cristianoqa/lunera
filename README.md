# Lunera

Lunera es una app Expo/React Native de salud femenina enfocada en seguimiento menstrual, embarazo, anticoncepción y menopausia con una postura clínica segura: orientación educativa, alertas de seguimiento sugerido y privacidad local-first.

## Qué incluye

- Predicción de ciclo y fases con histórico real
- Registro diario ampliado de sangrado, dolor, síntomas, moco cervical y hábitos
- Modos de vida para ciclo, embarazo/postparto, anticoncepción y menopausia
- Alertas clínicas educativas para patrones como ciclos largos, spotting repetido, sangrado abundante, señales de embarazo y carga de síntomas menopáusicos
- Chat IA local con límites clínicos claros y derivación a urgencias si detecta señales de alarma
- Exportación de informe PDF con resumen clínico

## Stack actual

- Expo SDK 57
- React Native 0.86
- TypeScript
- Zustand
- AsyncStorage para persistencia operativa local
- Supabase para sync/auth híbrida
- Expo Notifications, Print, Sharing, Secure Store y Local Authentication

## Comandos

```bash
expo start
expo run:android
expo start --web
vitest run
tsc --noEmit
```

## Privacidad

Los datos operativos viven en el dispositivo. Las copias/exportaciones y el flujo de sync están diseñados para usar cifrado, pero el almacenamiento local principal actual no debe comunicarse como “todo cifrado en reposo” hasta completar ese endurecimiento.

## Estructura principal

- `src/screens`: onboarding, auth, home, calendar, log, learn, premium, settings
- `src/services`: ciclo, embarazo, alertas clínicas, IA local, PDF, notificaciones, persistencia
- `src/store`: estado global con Zustand
- `src/content`: enciclopedia y consejos educativos
- `tests`: servicios, reglas clínicas y reportes

## Alcance actual del producto

Lunera prioriza producto-app. No depende de una landing comercial como pieza central y el foco actual está en calidad clínica, UX, seguridad y preparación para publicación.
