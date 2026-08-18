import type { CyclePhase } from "../types/cycle";

export interface BodyInsight {
  title: string;
  body: string;
  accent: string;
}

const INSIGHTS_ES: Record<CyclePhase, (day: number) => BodyInsight> = {
  menstrual: (day) => ({
    title: `Día ${day} · Fase Menstrual`,
    body:
      "Tus niveles de estrógeno están en el punto más bajo. Es completamente normal sentir fatiga o sensibilidad emocional. Prioriza el descanso, la hidratación profunda y alimentos ricos en hierro.",
    accent: "#E85D4C",
  }),
  follicular: (day) => ({
    title: `Día ${day} · Fase Folicular`,
    body:
      "El estrógeno empieza a subir gradualmente. Es un buen momento para retomar rutinas, planificar proyectos y mover el cuerpo con suavidad. Tu energía suele aumentar día a día.",
    accent: "#5B9A8B",
  }),
  ovulation: (day) => ({
    title: `Día ${day} · Ovulación`,
    body:
      "Estás en tu ventana de máxima fertilidad y pico de estrógeno. Puedes sentirte más sociable, creativa y con mayor libido. Escucha las señales de tu cuerpo sin presionarte.",
    accent: "#E879A9",
  }),
  luteal: (day) => ({
    title: `Día ${day} · Fase Lútea`,
    body:
      "La progesterona domina esta fase. Es habitual notar hinchazón, antojos o cambios de ánimo. Reduce cafeína, prioriza el sueño reparador y registra síntomas para detectar patrones.",
    accent: "#4A3F6B",
  }),
};

const INSIGHTS_EN: Record<CyclePhase, (day: number) => BodyInsight> = {
  menstrual: (day) => ({
    title: `Day ${day} · Menstrual Phase`,
    body:
      "Estrogen is at its lowest. Fatigue and emotional sensitivity are normal. Prioritize rest, deep hydration, and iron-rich foods.",
    accent: "#E85D4C",
  }),
  follicular: (day) => ({
    title: `Day ${day} · Follicular Phase`,
    body:
      "Estrogen is rising steadily. A good time to restart routines, plan ahead, and move gently. Energy often builds day by day.",
    accent: "#5B9A8B",
  }),
  ovulation: (day) => ({
    title: `Day ${day} · Ovulation`,
    body:
      "Peak fertility and estrogen. You may feel more social, creative, and energetic. Listen to your body without pressure.",
    accent: "#E879A9",
  }),
  luteal: (day) => ({
    title: `Day ${day} · Luteal Phase`,
    body:
      "Progesterone leads this phase. Bloating, cravings, and mood shifts are common. Reduce caffeine, protect sleep, and log symptoms.",
    accent: "#4A3F6B",
  }),
};

export function getBodyTodayInsight(phase: CyclePhase, cycleDay: number, locale = "es"): BodyInsight {
  const map = locale.startsWith("en") ? INSIGHTS_EN : INSIGHTS_ES;
  return map[phase](cycleDay);
}
