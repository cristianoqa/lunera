/** Contenido médico estático — Glosario Lunera (ES) */

export interface EncyclopediaArticle {
  id: string;
  title: string;
  body: string;
}

export interface EncyclopediaCategory {
  id: string;
  title: string;
  articles: EncyclopediaArticle[];
}

export const ENCYCLOPEDIA_ES: EncyclopediaCategory[] = [
  {
    id: "phases",
    title: "Las 4 fases hormonales",
    articles: [
      {
        id: "menstrual",
        title: "Fase menstrual (días 1-5)",
        body:
          "Tras la ovulación, estrógeno y progesterona caen de forma brusca. El endometrio —la capa interna del útero— se desprende y produce el sangrado menstrual. Es normal sentir más fatiga, sensibilidad y necesidad de descanso. Prioriza sueño, hidratación y alimentos ricos en hierro.",
      },
      {
        id: "follicular",
        title: "Fase folicular (días 6-13)",
        body:
          "La hormona FSH estimula la maduración de folículos en los ovarios. El estrógeno sube progresivamente, lo que suele traducirse en más energía, mejor ánimo y piel más luminosa. Es una fase favorable para entrenamientos más intensos y proyectos que requieran concentración.",
      },
      {
        id: "ovulation",
        title: "La ovulación (día 14 aprox.)",
        body:
          "Un pico de LH desencadena la liberación del óvulo. Es el momento de máxima fertilidad del ciclo. Muchas personas notan libido elevada y cambios en el moco cervical, que puede volverse claro y elástico, similar a clara de huevo.",
      },
      {
        id: "luteal",
        title: "Fase lútea (días 15-28)",
        body:
          "La progesterona domina y prepara el útero por si hay embarazo. La digestión puede ralentizarse y aparecer hinchazón, antojos o síntomas de SPM (síndrome premenstrual) en los días previos a la regla.",
      },
    ],
  },
  {
    id: "pain",
    title: "Entendiendo el dolor y síntomas",
    articles: [
      {
        id: "cramps",
        title: "Cólicos menstruales (dismenorrea)",
        body:
          "Las prostaglandinas provocan contracciones uterinas para expulsar el endometrio. El calor local (bolsa térmica), ejercicio suave y antiinflamatorios OTC pueden aliviar el dolor. Consulta si incapacita tus actividades habituales.",
      },
      {
        id: "migraine",
        title: "Migrañas catameniales",
        body:
          "La caída brusca de estrógenos justo antes de la regla puede desencadenar dolores de cabeza en personas susceptibles. Llevar un registro ayuda a anticiparlos y hablar con tu médica sobre prevención.",
      },
      {
        id: "mood",
        title: "Cambios de humor y ansiedad",
        body:
          "Al final del ciclo, la progesterona desciende y puede reducir la serotonina en el cerebro, afectando el ánimo. Descanso, actividad física moderada y apoyo emocional suelen ayudar; busca ayuda profesional si los síntomas son intensos.",
      },
      {
        id: "digestion",
        title: "Inflamación y digestión",
        body:
          "La progesterona relaja el músculo liso intestinal, lo que puede causar estreñimiento o gases en fase lútea. Fibra, agua y movimiento ligero pueden mejorar el confort digestivo.",
      },
    ],
  },
  {
    id: "contraception",
    title: "Anticonceptivos y tu ciclo",
    articles: [
      {
        id: "pill",
        title: "Píldora oral combinada",
        body:
          "Las hormonas sintéticas suprimen la ovulación. El sangrado mensual durante la pausa es por deprivación hormonal, no una menstruación ovulatoria real. Sigue siempre la pauta de tu prescriptora.",
      },
      {
        id: "iud",
        title: "DIU (cobre vs. hormonal)",
        body:
          "El DIU de cobre genera una reacción inflamatoria local que dificulta la fecundación. El hormonal libera levonorgestrel y adelgaza el endometrio, reduciendo el sangrado en muchos casos.",
      },
      {
        id: "implant_patch",
        title: "Implante y parche anticonceptivo",
        body:
          "Liberan progestágenos de forma continua. Pueden causar manchados irregulares o, en algunas usuarias, amenorrea (ausencia de sangrado). La adaptación varía entre personas.",
      },
    ],
  },
  {
    id: "alerts",
    title: "Alertas médicas y patologías",
    articles: [
      {
        id: "pcos",
        title: "Síndrome de ovario poliquístico (SOP)",
        body:
          "Trastorno endocrino con ciclos largos (>35 días), ovulación irregular y a veces exceso de andrógenos. Requiere diagnóstico y seguimiento ginecológico; Lunera puede ayudarte a documentar patrones, no a diagnosticar.",
      },
      {
        id: "endometriosis",
        title: "Endometriosis",
        body:
          "Tejido similar al endometrio crece fuera del útero, causando dolor pélvico severo e invalidante. Si el dolor interfiere con tu vida diaria, busca atención médica especializada cuanto antes.",
      },
      {
        id: "irregular",
        title: "Ciclos irregulares",
        body:
          "Se consideran irregulares variaciones de más de 7-9 días entre ciclos consecutivos. El estrés, cambios de peso, viajes o enfermedades pueden influir. Persistencia requiere evaluación profesional.",
      },
    ],
  },
  {
    id: "fertility",
    title: "Fertilidad y bienestar",
    articles: [
      {
        id: "fertile_window",
        title: "La ventana fértil real",
        body:
          "Dura aproximadamente 6 días: los espermatozoides pueden vivir ~5 días y el óvulo ~24 horas tras la ovulación. Conocer tu ventana ayuda tanto si buscas embarazo como si quieres evitarlo (siempre con método anticonceptivo fiable).",
      },
      {
        id: "basal_temp",
        title: "Temperatura basal",
        body:
          "Tras la ovulación, la temperatura corporal basal suele subir unos 0,3-0,5 °C. Medirla cada mañana al despertar confirma que la ovulación ya ocurrió, aunque no predice el día exacto con antelación.",
      },
      {
        id: "nutrition",
        title: "Nutrición por fases",
        body:
          "En la regla, prioriza hierro y vitamina C. En fase lútea, carbohidratos complejos y magnesio pueden estabilizar energía y antojos. Una alimentación variada apoya el equilibrio hormonal general.",
      },
    ],
  },
];

export const ENCYCLOPEDIA_DISCLAIMER_ES =
  "Contenido educativo de carácter informativo basado en las guías generales de la OMS y el ACOG. Lunera no provee diagnósticos médicos ni sustituye la consulta con un ginecólogo profesional.";
