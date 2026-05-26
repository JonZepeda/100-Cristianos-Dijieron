// Base de datos de preguntas cristianas por defecto para "100 Cristianos Dijeron"
const DEFAULT_QUESTIONS = [
  {
    id: 1,
    category: "Personajes Bíblicos",
    question: "Menciona un personaje de la Biblia conocido por tener mucha paciencia.",
    answers: [
      { text: "Job", points: 52 },
      { text: "Moisés", points: 21 },
      { text: "Abraham", points: 14 },
      { text: "Noé", points: 8 },
      { text: "José", points: 5 }
    ]
  },
  {
    id: 2,
    category: "Vida en la Iglesia",
    question: "Nombra una excusa común que da un cristiano para llegar tarde al culto.",
    answers: [
      { text: "Había mucho tráfico", points: 38 },
      { text: "No sonó mi alarma / Me dormí", points: 29 },
      { text: "No encontraba la Biblia / ropa", points: 17 },
      { text: "Se me hizo tarde desayunando", points: 11 },
      { text: "Me retrasé peinando a los niños", points: 5 }
    ]
  },
  {
    id: 3,
    category: "Milagros de Jesús",
    question: "Menciona un milagro de Jesús que todos recuerdan de memoria.",
    answers: [
      { text: "Caminar sobre el agua", points: 41 },
      { text: "Multiplicar los panes y peces", points: 30 },
      { text: "Convertir agua en vino", points: 18 },
      { text: "Resucitar a Lázaro", points: 8 },
      { text: "Sanar al ciego", points: 3 }
    ]
  },
  {
    id: 4,
    category: "Cosas de la Iglesia",
    question: "Nombra algo que siempre encuentras dentro de un templo o iglesia.",
    answers: [
      { text: "Biblias", points: 45 },
      { text: "Bancas o Sillas", points: 24 },
      { text: "Una Cruz", points: 16 },
      { text: "El Púlpito o Altar", points: 10 },
      { text: "Instrumentos musicales", points: 5 }
    ]
  },
  {
    id: 5,
    category: "Música Cristiana",
    question: "Menciona un canto clásico de adoración o himno que toda la iglesia sabe cantar.",
    answers: [
      { text: "Cuán Grande es Él", points: 46 },
      { text: "Sublime Gracia", points: 27 },
      { text: "Alabaré al Señor", points: 14 },
      { text: "Renúvame Señor", points: 8 },
      { text: "La Niña de tus Ojos", points: 5 }
    ]
  },
  {
    id: 6,
    category: "Geografía Bíblica",
    question: "Nombra un monte famoso mencionado en la Biblia.",
    answers: [
      { text: "Monte Sinaí", points: 50 },
      { text: "Monte Calvario / Gólgota", points: 26 },
      { text: "Monte de los Olivos", points: 14 },
      { text: "Monte Horeb", points: 6 },
      { text: "Monte Ararat", points: 4 }
    ]
  },
  {
    id: 7,
    category: "Libros Bíblicos",
    question: "Menciona un libro del Antiguo Testamento que a la gente le cuesta encontrar o pronunciar.",
    answers: [
      { text: "Habacuc", points: 36 },
      { text: "Deuteronomio", points: 28 },
      { text: "Sofonías", points: 19 },
      { text: "Levítico", points: 11 },
      { text: "Hageo", points: 6 }
    ]
  },
  {
    id: 8,
    category: "Arca de Noé",
    question: "Nombra un animal del Arca de Noé que no te gustaría tener de mascota en tu casa.",
    answers: [
      { text: "León", points: 40 },
      { text: "Serpiente", points: 32 },
      { text: "Elefante", points: 15 },
      { text: "Cocodrilo", points: 9 },
      { text: "Zorrillo / Mofeta", points: 4 }
    ]
  },
  {
    id: 9,
    category: "Vida en la Iglesia",
    question: "Menciona algo que los hermanos hacen durante el sermón del pastor.",
    answers: [
      { text: "Tomar notas / Escribir", points: 43 },
      { text: "Pestañear / Quedarse dormido", points: 28 },
      { text: "Buscar citas bíblicas", points: 15 },
      { text: "Ver el celular discretamente", points: 10 },
      { text: "Decir ¡Amén! o ¡Aleluya!", points: 4 }
    ]
  },
  {
    id: 10,
    category: "Eventos Bíblicos",
    question: "Nombra una de las plagas más memorables que cayeron sobre Egipto.",
    answers: [
      { text: "La plaga de las Ranas", points: 35 },
      { text: "Conversión de agua en Sangre", points: 28 },
      { text: "La muerte de los Primogénitos", points: 19 },
      { text: "La plaga de Langostas", points: 12 },
      { text: "La plaga de Piojos / Moscas", points: 6 }
    ]
  }
];

// Inicializar base de datos en localStorage si no existe
function getQuestions() {
  const stored = localStorage.getItem('cristianos_dijeron_questions');
  if (!stored) {
    localStorage.setItem('cristianos_dijeron_questions', JSON.stringify(DEFAULT_QUESTIONS));
    return DEFAULT_QUESTIONS;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    console.error("Error cargando preguntas del localStorage, usando por defecto", e);
    return DEFAULT_QUESTIONS;
  }
}

function saveQuestions(questions) {
  localStorage.setItem('cristianos_dijeron_questions', JSON.stringify(questions));
}

// Inicializar base de datos
window.gameQuestions = getQuestions();
console.log("Base de datos de preguntas cargada con éxito.", window.gameQuestions.length, "preguntas disponibles.");
