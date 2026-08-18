export interface MenopauseAdvice {
  title: string;
  body: string;
  checkup: string;
}

const ROTATION: MenopauseAdvice[] = [
  {
    title: "Sofocos y sudoración",
    body: "Las oleadas de calor y el sudor nocturno son frecuentes en la transición. Capas de ropa, habitación fresca y menos cafeína por la tarde suelen ayudar. Si interrumpen el sueño de forma persistente, coméntalo en consulta.",
    checkup: "Puedes preguntar por opciones no hormonales y hormonales según tu historial.",
  },
  {
    title: "Huesos y densitometría",
    body: "Al bajar los estrógenos se acelera la pérdida ósea. Calcio alimentario, vitamina D, fuerza suave y no fumar protegen. La densitometría se valora sobre todo tras la menopausia o si hay factores de riesgo.",
    checkup: "Recordatorio: habla con tu médica de una densitometría si no te la han propuesto.",
  },
  {
    title: "Corazón y tensión",
    body: "El riesgo cardiovascular sube tras la menopausia. Caminar, dormir y vigilar tensión, colesterol y glucosa importan tanto como los sofocos.",
    checkup: "Chequeo cardiovascular: tensión, lípidos y glucosa según tu edad y antecedentes.",
  },
  {
    title: "Sequedad e incomodidad",
    body: "La sequedad vaginal y las relaciones dolorosas son tratables (hidratantes, lubricantes, terapias locales). No es algo que «haya que aguantar».",
    checkup: "Si hay picores, mal olor o sangrado postmenopáusico, pide cita: el sangrado tras 12 meses sin regla merece valoración.",
  },
  {
    title: "Sueño y ánimo",
    body: "Insomnio y cambios de humor intensos pueden ir con la fluctuación hormonal. Rutina nocturna, menos pantallas y apoyo emocional ayudan; si hay bajo ánimo persistente, busca ayuda profesional.",
    checkup: "No minimices la salud mental en esta etapa: es parte del seguimiento ginecológico y general.",
  },
];

export function getMenopauseAdvice(todayIso: string): MenopauseAdvice {
  const day = Number(todayIso.slice(-2)) || 1;
  return ROTATION[day % ROTATION.length];
}
