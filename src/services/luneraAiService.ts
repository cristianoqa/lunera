/**
 * Motor de IA local Lunera — contexto empático + chat educativo + filtro de emergencia.
 * Privacidad: todo corre en dispositivo. API externa preparada como esqueleto v2.
 */

import type { CyclePhase, CyclePrediction, CycleRecord } from "../types/cycle";
import type { DailyLog } from "../types/dailyLog";
import type { AppMode } from "../types/lifeCycle";
import type { BodyInsight } from "../utils/bodyInsight";
import type { ClinicalAlert } from "../types/clinical";
import { getMenopauseAdvice } from "../content/menopauseAdvice";
import { todayISOLocal } from "./cyclePredictor";

export const AI_DISCLAIMER =
  "Lunera IA es una herramienta de asistencia educativa y de bienestar. No provee diagnósticos médicos oficiales ni sustituye la consulta ginecológica profesional.";

export interface AiUserContext {
  cycleDay: number;
  phase: CyclePhase;
  todaySymptoms: string[];
  todayPain: number;
  todayBleeding: number;
  todayMoods: string[];
  recentLogs: DailyLog[];
  cycles: CycleRecord[];
  prediction: CyclePrediction | null;
  locale: string;
  appMode?: AppMode;
  pregnancyWeek?: number | null;
  clinicalAlerts?: ClinicalAlert[];
}

const EMERGENCY_PATTERNS: RegExp[] = [
  /sangrado\s+hemorr[aá]gico/i,
  /hemorragia/i,
  /dolor\s+insoportable/i,
  /fiebre\s+(muy\s+)?alta/i,
  /desmayo/i,
  /desmay[eéo]/i,
  /p[eé]rdida\s+de\s+conocimiento/i,
  /sangrado\s+(muy\s+)?abundante/i,
  /emergency/i,
  /unbearable\s+pain/i,
  /heavy\s+bleeding/i,
  /fainting/i,
  /hemorrhage/i,
  /sangramento\s+hemorr[aá]gico/i,
  /dor\s+insuport[aá]vel/i,
  /desmaio/i,
];

export function detectMedicalEmergency(text: string): boolean {
  const normalized = text.trim();
  if (!normalized) return false;
  return EMERGENCY_PATTERNS.some((re) => re.test(normalized));
}

const PHASE_BASE_ES: Record<CyclePhase, string> = {
  menstrual:
    "Tus niveles de estrógeno y progesterona están bajos mientras el endometrio se desprende. Es normal notar fatiga o sensibilidad.",
  follicular:
    "El estrógeno está subiendo y los folículos maduran. Suele aumentar la energía y la claridad mental.",
  ovulation:
    "Estás cerca del pico de LH y fertilidad. El estrógeno está alto: puedes notar más libido y moco cervical elástico.",
  luteal:
    "La progesterona domina. Es habitual hinchazón, antojos o cambios de ánimo mientras el cuerpo se prepara para la regla.",
};

const SYMPTOM_HINTS_ES: Record<string, string> = {
  headache: "Tu dolor de cabeza puede relacionarse con oscilaciones hormonales de esta fase.",
  migraine: "La caída de estrógenos suele desencadenar migrañas catameniales: reduce pantallas, hidrátate y prioriza descanso.",
  cramps: "Los cólicos responden a prostaglandinas que contraen el útero: calor local y movimiento suave ayudan.",
  fatigue: "La fatiga es frecuente en esta fase: prioriza sueño y comidas con hierro.",
  bloating: "La hinchazón suele venir de retención hídrica por progesterona: reduce sal y muévete con suavidad.",
  breast_tenderness: "La sensibilidad mamaria es típica con progesterona elevada.",
  insomnia: "El sueño irregular puede empeorar el SPM: rutina nocturna y menos cafeína ayudan.",
  cravings: "Los antojos son comunes en lútea: prioriza carbohidratos complejos y proteína.",
  nausea: "Las náuseas pueden acompañar la menstruación o el pico ovulatorio; come poco y a menudo.",
  back_pain: "El dolor de espalda baja acompaña a menudo los cólicos: calor y posturas suaves.",
  spotting: "El spotting puede aparecer cerca de la ovulación o al inicio de la regla; si es abundante, consulta.",
  brain_fog: "La niebla mental aparece a veces al final del ciclo; listas cortas y pausas ayudan.",
  libido_high: "La libido alta encaja con el pico de estrógenos en ovulación.",
  libido_low: "La libido baja es frecuente en menstruación o lútea tardía.",
  anxious: "La ansiedad puede subir cuando cae la progesterona; respiración y descanso ayudan.",
  irritable: "La irritabilidad es un síntoma clásico de SPM en fase lútea.",
  tired: "El cansancio pide ritmo más lento hoy.",
};

function phaseAdvice(phase: CyclePhase): string {
  switch (phase) {
    case "menstrual":
      return "Prioriza descanso, hidratación profunda y alimentos ricos en hierro.";
    case "follicular":
      return "Buen momento para moverte con más energía y planificar con claridad.";
    case "ovulation":
      return "Escucha tu cuerpo sin presión: hidrátate y registra cambios en el flujo.";
    case "luteal":
      return "Reduce cafeína, protege el sueño y sé amable con tu ritmo.";
  }
}

function labelOf(id: string): string {
  return id.replace(/^sym_/, "").replace(/^mood_/, "").replace(/_/g, " ");
}

function symptomHintLines(ctx: AiUserContext): string[] {
  const hints = ctx.todaySymptoms
    .map((s) => SYMPTOM_HINTS_ES[s] ?? SYMPTOM_HINTS_ES[s.replace(/^sym_/, "")])
    .filter(Boolean)
    .slice(0, 2);
  if (ctx.todayPain >= 4) {
    hints.push("Registraste un dolor alto: calor local y descanso; si incapacita, consulta a tu médica.");
  } else if (ctx.todayPain >= 2) {
    hints.push("Tu nivel de dolor de hoy merece seguimiento: anota qué lo alivia.");
  }
  if (ctx.todayMoods.includes("anxious") || ctx.todayMoods.includes("irritable")) {
    hints.push(SYMPTOM_HINTS_ES.anxious);
  }
  return hints;
}

/** Componente A — widget Home dinámico según etapa + síntomas de hoy */
export function generateBodyTodayAi(ctx: AiUserContext): BodyInsight {
  const mode = ctx.appMode ?? "MENSTRUATION_TRACKING";
  const extra = symptomHintLines(ctx);
  const alertLine = ctx.clinicalAlerts?.[0]
    ? "Lunera ha detectado un patrón que merece observación clínica; revisa tu tarjeta de seguimiento sugerido."
    : null;

  if (mode === "MENOPAUSE_SUPPORT") {
    const advice = getMenopauseAdvice(todayISOLocal());
    return {
      title: "Hoy · Transición y menopausia",
      body: [advice.body, ...extra, alertLine, "Puedes preguntarme por sofocos, sueño, ánimo o chequeos."].filter(Boolean).join(" "),
      accent: "#8B7BA8",
    };
  }

  if (mode === "PREGNANCY_CARE") {
    const week = ctx.pregnancyWeek && ctx.pregnancyWeek > 0 ? ctx.pregnancyWeek : 1;
    return {
      title: `Hoy · Semana ${week} de embarazo`,
      body: [
        "Lunera te acompaña en el embarazo con registro de síntomas y recordatorios educativos, sin sustituir el control prenatal.",
        ...extra,
        alertLine,
        "Si hay sangrado abundante, dolor intenso o pérdida de líquido, busca atención urgente.",
      ]
        .filter(Boolean)
        .join(" "),
      accent: "#E879A9",
    };
  }

  if (mode === "CONTRACEPTION_CONTROL") {
    return {
      title: "Hoy · Anticonceptivos",
      body: [
        "Sigue tu método a la hora prevista. Lunera no usa la ventana fértil como anticoncepción.",
        ...extra,
        alertLine,
        "Si olvidas una toma, consulta el prospecto o a tu profesional de salud.",
      ]
        .filter(Boolean)
        .join(" "),
      accent: "#5B9A8B",
    };
  }

  const accents: Record<CyclePhase, string> = {
    menstrual: "#E85D4C",
    follicular: "#5B9A8B",
    ovulation: "#E879A9",
    luteal: "#4A3F6B",
  };

  const title = `Día ${ctx.cycleDay} · Fase ${
    ctx.phase === "menstrual"
      ? "Menstrual"
      : ctx.phase === "follicular"
        ? "Folicular"
        : ctx.phase === "ovulation"
          ? "Ovulación"
          : "Lútea"
  }`;

  const parts: string[] = [PHASE_BASE_ES[ctx.phase], ...extra, alertLine ?? "", phaseAdvice(ctx.phase)];

  return {
    title,
    body: parts.filter(Boolean).join(" "),
    accent: accents[ctx.phase],
  };
}

export function buildSystemContext(ctx: AiUserContext): string {
  const last90 = ctx.recentLogs.slice(0, 90);
  const symptomSummary = last90
    .slice(0, 14)
    .map((l) => `${l.date}: dolor ${l.pain}, sangrado ${l.bleeding}, síntomas [${[...(l.symptoms ?? []), ...(l.extraSymptoms ?? [])].join(", ") || "—"}]`)
    .join("\n");

  return [
    "Eres Lunera IA, asistente educativa de salud menstrual (OMS/ACOG).",
    "NO diagnosticas. NO recetas fármacos. Remite a profesional si hay alarma.",
    `Hoy: día ${ctx.cycleDay} del ciclo, fase ${ctx.phase}.`,
    ctx.prediction
      ? `Próxima regla estimada: ${ctx.prediction.predictedNextPeriodStart} (confianza ${ctx.prediction.confidence}).`
      : "",
    `Síntomas de hoy: ${ctx.todaySymptoms.join(", ") || "ninguno"}. Dolor ${ctx.todayPain}/5. Sangrado ${ctx.todayBleeding}/5.`,
    "Historial reciente:",
    symptomSummary || "(sin registros)",
  ]
    .filter(Boolean)
    .join("\n");
}

function localChatReply(message: string, ctx: AiUserContext): string {
  const q = message.toLowerCase();
  const mode = ctx.appMode ?? "MENSTRUATION_TRACKING";

  if (mode === "MENOPAUSE_SUPPORT") {
    const advice = getMenopauseAdvice(todayISOLocal());
    return `Estás en etapa de perimenopausia/menopausia: Lunera no predice regla ni ventana fértil. ${advice.body} Si quieres, cuéntame sofocos, sueño, ánimo o sequedad y te oriento de forma educativa.`;
  }
  if (mode === "PREGNANCY_CARE") {
    const week = ctx.pregnancyWeek && ctx.pregnancyWeek > 0 ? ctx.pregnancyWeek : null;
    return `Estás en modo embarazo${week ? ` (semana ${week})` : ""}. Lunera no predice ciclos. ${ctx.todaySymptoms.length ? `Hoy registraste: ${ctx.todaySymptoms.join(", ")}.` : "Puedes registrar náuseas, sueño o molestias en el diario."} Esto no sustituye el control prenatal.`;
  }
  if (mode === "CONTRACEPTION_CONTROL") {
    return `Estás en modo anticonceptivos. Sigue tu método a la hora prevista; Lunera no usa la ventana fértil como anticoncepción. ${ctx.todayPain ? `Dolor de hoy: ${ctx.todayPain}/5.` : ""} Si olvidas una toma, consulta el prospecto o a tu profesional.`;
  }

  if (/flujo|moco|clara\s+de\s+huevo|el[aá]stic/.test(q)) {
    if (ctx.phase === "ovulation" || (ctx.cycleDay >= 11 && ctx.cycleDay <= 16)) {
      return `Revisando tu calendario, hoy estás en el día ${ctx.cycleDay} (${ctx.phase === "ovulation" ? "ovulación" : "cerca de ovulación"}). El flujo elástico tipo clara de huevo es habitual: el estrógeno favorece moco cervical fértil. Es una señal saludable; Lunera no sustituye anticoncepción ni consejo médico.`;
    }
    return `El flujo cambia a lo largo del ciclo. Hoy (día ${ctx.cycleDay}, fase ${ctx.phase}) puede variar. Si es maloliente, con picor o sangre abundante, consulta a tu ginecóloga.`;
  }

  if (/c[oó]lico|dolor|pain|cramp/.test(q)) {
    return `En fase ${ctx.phase} (día ${ctx.cycleDay}) el dolor suele relacionarse con prostaglandinas o tensión muscular. Calor local, hidratación y reposo relativo ayudan. Tu registro de hoy marca dolor ${ctx.todayPain}/5. Si el dolor te incapacita, busca atención médica.`;
  }

  if (/retraso|atras|late|irregular/.test(q)) {
    return `Los ciclos pueden variar por estrés, viaje o sueño. Lunera estima la próxima regla en ${ctx.prediction?.predictedNextPeriodStart ?? "—"}. Variaciones de más de 7–9 días de forma persistente merecen evaluación profesional.`;
  }

  if (/spm|pms|humor|ansiedad|irritab/.test(q)) {
    return `En fase lútea la caída hormonal puede afectar ánimo y serotonina. Hoy estás en fase ${ctx.phase}. Sueño, movimiento suave y registrar patrones ayuda a anticiparlo. Si la ansiedad es intensa, habla con un profesional.`;
  }

  if (/embarazo|fertil|ovul/.test(q)) {
    return `Tu ventana fértil estimada es ${ctx.prediction?.fertileWindowStart ?? "—"} → ${ctx.prediction?.fertileWindowEnd ?? "—"}. Lunera es educativa y no es un método anticonceptivo fiable.`;
  }

  return `Hoy es tu día ${ctx.cycleDay} (${ctx.phase}). ${PHASE_BASE_ES[ctx.phase]} ${phaseAdvice(ctx.phase)} Si quieres, cuéntame un síntoma concreto (flujo, dolor, humor, retraso) y lo cruzo con tu registro.`;
}

export interface AiChatResult {
  kind: "reply" | "emergency";
  text: string;
  disclaimer: string;
}

/**
 * Respuesta del chat: filtro de emergencia primero, luego motor local.
 * Esqueleto v2: sustituir localChatReply por llamarApiLlm(system, message).
 */
export async function askLuneraAi(message: string, ctx: AiUserContext): Promise<AiChatResult> {
  if (detectMedicalEmergency(message)) {
    return {
      kind: "emergency",
      text: "Atención: Tus síntomas podrían requerir atención inmediata. Esto supera el límite educativo de Lunera. Por favor, acuda a urgencias o contacte a su ginecólogo de confianza de inmediato.",
      disclaimer: AI_DISCLAIMER,
    };
  }

  // TODO v2: const remote = await consultarModeloLenguajeIA(buildSystemContext(ctx), message);
  const text = localChatReply(message, ctx);
  return { kind: "reply", text, disclaimer: AI_DISCLAIMER };
}

/** Esqueleto v2 — API de red neuronal / LLM externo */
export async function consultarModeloLenguajeIA(
  _systemPrompt: string,
  _userMessage: string
): Promise<string | null> {
  void _systemPrompt;
  void _userMessage;
  // TODO v2: POST seguro con consentimiento + anonimización
  return null;
}

export function buildAiContextFromStore(input: {
  prediction: CyclePrediction | null;
  logs: DailyLog[];
  cycles: CycleRecord[];
  locale?: string;
  appMode?: AppMode;
  pregnancyWeek?: number | null;
    clinicalAlerts?: ClinicalAlert[];
}): AiUserContext {
  const today = todayISOLocal();
  const todayLog = input.logs.find((l) => l.date === today);
  const symptoms = [
    ...(todayLog?.symptoms ?? []),
    ...(todayLog?.extraSymptoms ?? []),
  ].map(String);

  return {
    cycleDay: input.prediction?.currentCycleDay ?? 0,
    phase: input.prediction?.currentPhase ?? "follicular",
    todaySymptoms: symptoms,
    todayPain: todayLog?.pain ?? 0,
    todayBleeding: todayLog?.bleeding ?? 0,
    todayMoods: (todayLog?.moods ?? []).map(String),
    recentLogs: input.logs.slice(0, 90),
    cycles: input.cycles,
    prediction: input.prediction,
    locale: input.locale ?? "es",
    appMode: input.appMode,
    pregnancyWeek: input.pregnancyWeek ?? null,
    clinicalAlerts: input.clinicalAlerts ?? [],
  };
}

export { labelOf };
