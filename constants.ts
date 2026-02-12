import { Question } from './types';

// --- MESACTS DATA ---
export const MESACTS_QUESTIONS: Question[] = [
  { id: 1, text: "Me siento parte de esta escuela/colegio" },
  { id: 2, text: "En mi escuela/colegio hay jóvenes en los que puedo confiar" },
  { id: 3, text: "En mi escuela/colegio me siento seguro/a" },
  { id: 4, text: "En mi escuela/colegio puedo hacer amigos/as" },
  { id: 5, text: "En esta escuela/colegio puedo equivocarme sin ser juzgado/a" },
  { id: 6, text: "En esta escuela/colegio no se discrimina a nadie" },
  { id: 7, text: "En mi escuela/colegio me ayudan a encontrar diferentes formas de expresarme" },
  { id: 8, text: "En mi escuela me dan herramientas para manejar los conflictos" },
  { id: 9, text: "En mi escuela/colegio facilitan espacios de participación y expresión de jóvenes" },
  { id: 10, text: "Dentro de mi escuela no hay situaciones de violencia (física, verbal, psicológica)" },
  { id: 11, text: "En mi escuela/colegio hay adultos en los que puedo confiar" },
];

export const MESACTS_OPTIONS = [
  { value: 1, label: "Totalmente en desacuerdo" },
  { value: 2, label: "En desacuerdo" },
  { value: 3, label: "De acuerdo" },
  { value: 4, label: "Totalmente de acuerdo" },
];

// --- TMMS-24 DATA ---
export const TMMS24_QUESTIONS: Question[] = [
  // Atención (1-8)
  { id: 1, text: "Presto mucha atención a los sentimientos." },
  { id: 2, text: "Normalmente me preocupo mucho por lo que siento." },
  { id: 3, text: "Normalmente dedico tiempo a pensar en mis emociones." },
  { id: 4, text: "Pienso que merece la pena prestar atención a mis emociones y estado de ánimo." },
  { id: 5, text: "Dejo que mis sentimientos afecten a mis pensamientos." },
  { id: 6, text: "Pienso en mi estado de ánimo constantemente." },
  { id: 7, text: "A menudo pienso en mis sentimientos." },
  { id: 8, text: "Presto mucha atención a cómo me siento." },
  // Claridad (9-16)
  { id: 9, text: "Tengo claros mis sentimientos." },
  { id: 10, text: "Frecuentemente puedo definir mis sentimientos." },
  { id: 11, text: "Casi siempre sé cómo me siento." },
  { id: 12, text: "Normalmente conozco mis sentimientos sobre las personas." },
  { id: 13, text: "A menudo me doy cuenta de mis sentimientos en diferentes situaciones." },
  { id: 14, text: "Siempre puedo decir cómo me siento." },
  { id: 15, text: "A veces puedo decir cuáles son mis emociones." },
  { id: 16, text: "Puedo llegar a comprender mis sentimientos." },
  // Reparación (17-24)
  { id: 17, text: "Aunque a veces me siento triste, suelo tener una visión optimista." },
  { id: 18, text: "Aunque me sienta mal, procuro pensar en cosas agradables." },
  { id: 19, text: "Cuando estoy triste, pienso en todos los placeres de la vida." },
  { id: 20, text: "Intento tener pensamientos positivos aunque me sienta mal." },
  { id: 21, text: "Si doy demasiadas vueltas a las cosas, complicándolas, trato de calmarme." },
  { id: 22, text: "Me preocupo por tener un buen estado de ánimo." },
  { id: 23, text: "Tengo mucha energía cuando me siento feliz." },
  { id: 24, text: "Cuando estoy enfadado intento cambiar mi estado de ánimo." },
];

export const TMMS24_OPTIONS = [
  { value: 1, label: "Nada de Acuerdo" },
  { value: 2, label: "Algo de Acuerdo" },
  { value: 3, label: "Bastante de acuerdo" },
  { value: 4, label: "Muy de Acuerdo" },
  { value: 5, label: "Totalmente de acuerdo" },
];