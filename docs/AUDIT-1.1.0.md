# Lunera v1.1.0 — Informe integral (QA Senior · PO Senior · Auditoría)

**Fecha:** 14 ago 2026  
**Versión:** 1.1.0 (versionCode 8)  
**Benchmark:** Clue, Flo

---

## 1. Resumen ejecutivo

Lunera 1.1.0 cierra brechas críticas de UX (Día 1 futuro), añade sincronización híbrida preparada, recordatorio 24 h antes del periodo, enciclopedia médica “Aprende” y esqueleto IA v2. **30/30 tests automatizados OK.** APK publicado en landing.

| Área | Estado | Nota |
|------|--------|------|
| Motor de ciclo | ✅ Mejorado | Ancla solo inicios ≤ hoy; futuros no distorsionan medias |
| Sync invitado→nube | ✅ Implementado | Vault cifrado Supabase + flag local |
| Notificaciones | ✅ Mejorado | Trigger DATE 24 h antes; IDs separados |
| Enciclopedia | ✅ Nuevo tab Aprende | 5 categorías + disclaimer OMS/ACOG |
| IA futura | ✅ Documentado | `consultarModeloPredictivoIA()` |
| vs Clue/Flo | 🟡 Parcial | Falta comunidad, wearables, ML real |

---

## 2. QA Senior — Regresión

### Automatizado
- `npm test`: **30/30** (predictor, recálculo, PDF, emojis, enciclopedia, auth, integración)
- `tsc --noEmit`: **0 errores**

### Manual (checklist emulador/dispositivo)
| Flujo | Resultado esperado |
|-------|-------------------|
| Onboarding invitado | Home con predicción |
| Calendario → Día 1 futuro | Alerta; no cambia contador |
| Calendario → Día 1 hoy/pasado | Recalcula Home |
| Tab Aprende | Acordeones + disclaimer legal |
| Registro cuenta | Sync local marcado |
| Settings → Premium/PDF/Iconos | Sin regresión |
| Log diario + Insights | Guardado OK |

> **Nota:** QA ADB no ejecutado en esta sesión (adb no en PATH del agente). Validación manual recomendada en dispositivo vía landing.

### Hallazgos corregidos en 1.1.0
1. **Crítico:** Día 1 futuro inflaba “días hasta próxima regla” → bloqueo + ancla ≤ hoy.
2. **Mayor:** Medias de ciclo contaminadas por inicios futuros → normalización ignora intervalos futuros.
3. **Mayor:** Recordatorio periodo usaba intervalo 12 h → trigger DATE 24 h antes.
4. **Menor:** `cancelAllScheduledNotifications` borraba recordatorio de periodo → IDs dedicados.

### Pendientes (no bloqueantes v1.1)
- OAuth Google/Apple en flujo principal (Supabase existe; app usa auth local).
- RevenueCat producción (demo activa).
- Traducción completa enciclopedia EN/PT (contenido ES; UI traducida).

---

## 3. PO Senior — Análisis de mercado

### Posicionamiento
- **Clue:** referencia en ciencia + neutralidad de género + artículos.
- **Flo:** predicciones ML + comunidad + monetización agresiva.
- **Lunera 1.1.0:** privacidad local-first, enciclopedia estilo Clue, calendario flexible, PDF médico — **diferenciador: cifrado + sin ads**.

### Brechas vs competencia (prioridad)
| Feature | Clue/Flo | Lunera 1.1.0 |
|---------|----------|--------------|
| Predicción ML | ✅ | Esqueleto v2 |
| Artículos educativos | ✅ | ✅ Aprende |
| Sync multi-dispositivo | ✅ | Vault cifrado (parcial) |
| Comunidad / foros | Flo ✅ | ❌ |
| Wearables | Flo ✅ | ❌ |
| Anticonceptivos tracking | Clue ✅ | Enciclopedia solo |
| Partner mode | Clue ✅ | ❌ |

### Recomendación roadmap
1. **v1.2:** OAuth + sync bidireccional; enciclopedia i18n.
2. **v2.0:** API ML (`consultarModeloPredictivoIA`); detección patrones SOP.
3. **v2.1:** RevenueCat live; ASO keywords “calendario menstrual privado”.

---

## 4. Auditoría técnica

### Seguridad
- Datos de salud en vault AES-GCM (Supabase) — ✅
- RLS Supabase — ✅ (migración 001)
- Auth local SHA-256 — aceptable MVP; bcrypt/Argon2 recomendado v1.2

### Rendimiento
- APK ~86 MB — revisar ProGuard/R8 y assets en v1.2
- AsyncStorage para logs — OK hasta ~400 entradas

### Accesibilidad / UX
- Tab bar 6 ítems — labels 10px; monitorizar en pantallas pequeñas
- Aprende: acordeones con `accessibilityState.expanded` — ✅

---

## 5. Artefactos

| Artefacto | Ruta |
|-----------|------|
| APK prueba | `dist/lunera-1.1.0-release.apk` |
| Play Store | `releases/play-store/Lunera-release.apk` |
| Landing | https://cristianoqa.github.io/descargar-lunera.html |

---

*Generado automáticamente en cierre de sprint Lunera 1.1.0.*
