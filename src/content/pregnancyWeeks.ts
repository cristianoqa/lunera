export interface PregnancyWeekCopy {
  fruit: string;
  development: string;
  advice: string;
}

const BY_WEEK: Record<number, PregnancyWeekCopy> = {
  4: {
    fruit: "semilla de amapola",
    development: "Empieza a formarse el tubo neural, base del sistema nervioso.",
    advice: "Mantén ácido fólico a diario y evita alcohol y tabaco.",
  },
  5: {
    fruit: "semilla de sésamo",
    development: "El corazón primitivo empieza a latir.",
    advice: "Sigue con ácido fólico. Consulta náuseas intensas con tu matrona.",
  },
  6: {
    fruit: "lenteja",
    development: "Aparecen esbozos de brazos y piernas.",
    advice: "Hidratación y comidas pequeñas si hay náuseas.",
  },
  7: {
    fruit: "arándano",
    development: "Se distinguen manos y pies en formación.",
    advice: "Descanso extra: el cansancio del primer trimestre es habitual.",
  },
  8: {
    fruit: "frambuesa",
    development: "El sistema nervioso sigue madurando a gran velocidad.",
    advice: "Mantén ácido fólico. Anota síntomas para la primera visita prenatal.",
  },
  12: {
    fruit: "ciruela",
    development: "El bebé mueve los dedos. Los órganos principales ya están formados.",
    advice: "Suele bajar el riesgo de aborto espontáneo. Pregunta por el screening del primer trimestre.",
  },
  16: {
    fruit: "aguacate",
    development: "El esqueleto se osifica y el bebé traga líquido amniótico.",
    advice: "Puedes notar los primeros movimientos (más claros en siguientes embarazos).",
  },
  20: {
    fruit: "plátano",
    development: "El oído se desarrolla: puede oír el latido de tu corazón.",
    advice: "Semana de la ecografía morfológica en muchos protocolos.",
  },
  24: {
    fruit: "mazorca de maíz",
    development: "Los pulmones producen surfactante. Hay viabilidad con cuidados intensivos.",
    advice: "Controla movimientos fetales y acude si disminuyen de forma clara.",
  },
  28: {
    fruit: "berenjena",
    development: "Abre y cierra los ojos. Gana grasa bajo la piel.",
    advice: "Tercer trimestre: revisa hierro, tensión y glucosa según tu seguimiento.",
  },
  32: {
    fruit: "col rizada",
    development: "Los huesos están formados pero aún flexibles para el parto.",
    advice: "Duerme de lado si puedes. Prepara el plan de parto con calma.",
  },
  36: {
    fruit: "sandía pequeña",
    development: "Los pulmones están casi listos. El bebé suele colocarse de cabeza.",
    advice: "Prepara la maleta del hospital y los teléfonos de urgencias.",
  },
  38: {
    fruit: "sandía",
    development: "A término temprano: el bebé sigue madurando, sobre todo el cerebro.",
    advice: "Reconoce señales de parto: contracciones regulares, pérdida de tapón, rotura de bolsa.",
  },
  40: {
    fruit: "sandía",
    development: "Fecha probable. El bebé está a término.",
    advice: "Si pasas de la semana 41, tu equipo valorará inducción. Confía en las revisiones.",
  },
};

const ANCHORS = Object.keys(BY_WEEK)
  .map(Number)
  .sort((a, b) => a - b);

export function getPregnancyWeekCopy(week: number): PregnancyWeekCopy {
  const clamped = Math.min(42, Math.max(1, Math.round(week)));
  if (BY_WEEK[clamped]) return BY_WEEK[clamped];
  const nearest = ANCHORS.reduce((best, w) => (Math.abs(w - clamped) < Math.abs(best - clamped) ? w : best));
  if (clamped < 4) {
    return {
      fruit: "semilla minúscula",
      development: "El embrión acaba de anidar. Aún es muy pronto para muchos síntomas.",
      advice: "Empieza o mantén ácido fólico. Confirma el embarazo con tu profesional de salud.",
    };
  }
  return BY_WEEK[nearest];
}
