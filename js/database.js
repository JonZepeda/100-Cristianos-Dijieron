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
      { text: "Renuévame Señor", points: 8 },
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
  },

  /* ===== PREGUNTAS CRISTIANAS (11-20) ===== */
  {
    id: 11,
    category: "Frutos del Espíritu",
    question: "Menciona uno de los frutos del Espíritu Santo.",
    answers: [
      { text: "Amor", points: 38 },
      { text: "Paz", points: 24 },
      { text: "Gozo / Alegría", points: 17 },
      { text: "Paciencia", points: 13 },
      { text: "Bondad", points: 8 }
    ]
  },
  {
    id: 12,
    category: "Los Apóstoles",
    question: "Nombra uno de los doce apóstoles de Jesús.",
    answers: [
      { text: "Pedro", points: 38 },
      { text: "Juan", points: 26 },
      { text: "Judas Iscariote", points: 18 },
      { text: "Santiago", points: 12 },
      { text: "Mateo", points: 6 }
    ]
  },
  {
    id: 13,
    category: "Navidad",
    question: "Nombra algo relacionado con la historia del nacimiento de Jesús.",
    answers: [
      { text: "El pesebre / establo", points: 34 },
      { text: "Los reyes magos", points: 26 },
      { text: "La estrella de Belén", points: 18 },
      { text: "Los pastores", points: 14 },
      { text: "El ángel Gabriel", points: 8 }
    ]
  },
  {
    id: 14,
    category: "Oración",
    question: "Menciona algo por lo que la gente suele orar a Dios.",
    answers: [
      { text: "Por la salud / sanidad", points: 36 },
      { text: "Por la familia", points: 24 },
      { text: "Por el trabajo / dinero", points: 18 },
      { text: "Por dar gracias", points: 14 },
      { text: "Por perdón", points: 8 }
    ]
  },
  {
    id: 15,
    category: "Mandamientos",
    question: "Menciona uno de los Diez Mandamientos.",
    answers: [
      { text: "No matarás", points: 35 },
      { text: "No robarás", points: 27 },
      { text: "Amarás a Dios sobre todo", points: 18 },
      { text: "Honra a tu padre y madre", points: 14 },
      { text: "No mentirás", points: 6 }
    ]
  },
  {
    id: 16,
    category: "Animales en la Biblia",
    question: "Nombra un animal que aparece en alguna historia de la Biblia.",
    answers: [
      { text: "La serpiente (Edén)", points: 32 },
      { text: "La ballena / pez de Jonás", points: 26 },
      { text: "El cordero", points: 20 },
      { text: "La paloma (Noé)", points: 16 },
      { text: "El león (Daniel)", points: 6 }
    ]
  },
  {
    id: 17,
    category: "Reyes de Israel",
    question: "Nombra un rey famoso de la Biblia.",
    answers: [
      { text: "Rey David", points: 42 },
      { text: "Rey Salomón", points: 30 },
      { text: "Rey Saúl", points: 14 },
      { text: "Rey Herodes", points: 9 },
      { text: "Rey Nabucodonosor", points: 5 }
    ]
  },
  {
    id: 18,
    category: "Mujeres de la Biblia",
    question: "Nombra una mujer importante en la Biblia.",
    answers: [
      { text: "María (madre de Jesús)", points: 42 },
      { text: "Eva", points: 25 },
      { text: "Sara", points: 15 },
      { text: "Rut", points: 12 },
      { text: "Ester", points: 6 }
    ]
  },
  {
    id: 19,
    category: "Vida Cristiana",
    question: "Menciona algo que un buen cristiano debería hacer cada día.",
    answers: [
      { text: "Orar", points: 38 },
      { text: "Leer la Biblia", points: 28 },
      { text: "Dar gracias a Dios", points: 15 },
      { text: "Ayudar al prójimo", points: 12 },
      { text: "Perdonar", points: 7 }
    ]
  },
  {
    id: 20,
    category: "Símbolos Cristianos",
    question: "Nombra un símbolo que represente la fe cristiana.",
    answers: [
      { text: "La cruz", points: 48 },
      { text: "El pez (Ictus)", points: 20 },
      { text: "La paloma", points: 15 },
      { text: "El pan y el vino", points: 11 },
      { text: "El cordero", points: 6 }
    ]
  },

  /* ===== PREGUNTAS DE CULTURA GENERAL (21-30) ===== */
  {
    id: 21,
    category: "Cultura General",
    question: "Nombra un planeta del sistema solar.",
    answers: [
      { text: "Marte", points: 32 },
      { text: "Júpiter", points: 26 },
      { text: "Saturno", points: 20 },
      { text: "Venus", points: 16 },
      { text: "Tierra", points: 6 }
    ]
  },
  {
    id: 22,
    category: "Geografía",
    question: "Menciona un continente del mundo.",
    answers: [
      { text: "América", points: 32 },
      { text: "Europa", points: 26 },
      { text: "Asia", points: 20 },
      { text: "África", points: 17 },
      { text: "Oceanía", points: 5 }
    ]
  },
  {
    id: 23,
    category: "Profesiones",
    question: "Menciona una profesión u oficio muy común.",
    answers: [
      { text: "Doctor / Médico", points: 32 },
      { text: "Maestro / Profesor", points: 26 },
      { text: "Policía", points: 18 },
      { text: "Ingeniero", points: 15 },
      { text: "Abogado", points: 9 }
    ]
  },
  {
    id: 24,
    category: "Comida",
    question: "Menciona una fruta de color amarillo.",
    answers: [
      { text: "Plátano / Banana", points: 42 },
      { text: "Piña", points: 22 },
      { text: "Limón", points: 18 },
      { text: "Mango", points: 12 },
      { text: "Maracuyá", points: 6 }
    ]
  },
  {
    id: 25,
    category: "Deportes",
    question: "Nombra un deporte que se juega con una pelota.",
    answers: [
      { text: "Fútbol", points: 45 },
      { text: "Baloncesto", points: 24 },
      { text: "Tenis", points: 14 },
      { text: "Voleibol", points: 11 },
      { text: "Béisbol", points: 6 }
    ]
  },
  {
    id: 26,
    category: "Tecnología",
    question: "Menciona algo que la gente usa todos los días en su celular.",
    answers: [
      { text: "WhatsApp / Mensajes", points: 38 },
      { text: "Redes sociales", points: 26 },
      { text: "La cámara / fotos", points: 16 },
      { text: "El reloj / alarma", points: 12 },
      { text: "YouTube / videos", points: 8 }
    ]
  },
  {
    id: 27,
    category: "Naturaleza",
    question: "Nombra algo que puedes ver en el cielo.",
    answers: [
      { text: "El sol", points: 32 },
      { text: "Las nubes", points: 25 },
      { text: "La luna", points: 20 },
      { text: "Las estrellas", points: 15 },
      { text: "Un avión / pájaro", points: 8 }
    ]
  },
  {
    id: 28,
    category: "Cuerpo Humano",
    question: "Nombra una parte de la cara.",
    answers: [
      { text: "Ojos", points: 32 },
      { text: "Nariz", points: 25 },
      { text: "Boca", points: 20 },
      { text: "Orejas", points: 15 },
      { text: "Cejas", points: 8 }
    ]
  },
  {
    id: 29,
    category: "Colores",
    question: "Menciona un color que tenga el arcoíris.",
    answers: [
      { text: "Rojo", points: 28 },
      { text: "Azul", points: 24 },
      { text: "Amarillo", points: 20 },
      { text: "Verde", points: 16 },
      { text: "Naranja", points: 12 }
    ]
  },
  {
    id: 30,
    category: "Vida Diaria",
    question: "Menciona algo que la gente hace al despertar por la mañana.",
    answers: [
      { text: "Cepillarse los dientes", points: 32 },
      { text: "Desayunar", points: 25 },
      { text: "Bañarse / ducharse", points: 20 },
      { text: "Ver el celular", points: 15 },
      { text: "Tomar café", points: 8 }
    ]
  },

  /* ===== PREGUNTAS AMIGABLES PARA TODOS (31-40) ===== */
  {
    id: 31,
    category: "Fiestas",
    question: "Menciona algo que no puede faltar en una fiesta de cumpleaños.",
    answers: [
      { text: "El pastel / la torta", points: 35 },
      { text: "Globos", points: 24 },
      { text: "Música", points: 18 },
      { text: "Regalos", points: 15 },
      { text: "Las velas", points: 8 }
    ]
  },
  {
    id: 32,
    category: "Vida Diaria",
    question: "Nombra algo que la gente hace para relajarse.",
    answers: [
      { text: "Ver TV / películas", points: 30 },
      { text: "Dormir / tomar una siesta", points: 25 },
      { text: "Escuchar música", points: 18 },
      { text: "Leer", points: 15 },
      { text: "Salir a caminar", points: 12 }
    ]
  },
  {
    id: 33,
    category: "Comida",
    question: "Menciona una comida que a casi todos les gusta.",
    answers: [
      { text: "Pizza", points: 34 },
      { text: "Tacos", points: 24 },
      { text: "Hamburguesa", points: 18 },
      { text: "Pollo frito", points: 15 },
      { text: "Helado", points: 9 }
    ]
  },
  {
    id: 34,
    category: "El Hogar",
    question: "Nombra algo que casi siempre encuentras en una cocina.",
    answers: [
      { text: "Refrigerador", points: 28 },
      { text: "Estufa", points: 24 },
      { text: "Platos / vasos", points: 20 },
      { text: "Microondas", points: 16 },
      { text: "Cubiertos", points: 12 }
    ]
  },
  {
    id: 35,
    category: "Aire Libre",
    question: "Menciona algo que llevarías a un día de campo o picnic.",
    answers: [
      { text: "Comida / sándwiches", points: 32 },
      { text: "Bebidas", points: 25 },
      { text: "Mantel o cobija", points: 18 },
      { text: "Frutas", points: 15 },
      { text: "Pelota o juegos", points: 10 }
    ]
  },
  {
    id: 36,
    category: "Mascotas",
    question: "Nombra una mascota popular.",
    answers: [
      { text: "Perro", points: 45 },
      { text: "Gato", points: 28 },
      { text: "Pez", points: 12 },
      { text: "Pájaro / loro", points: 9 },
      { text: "Conejo / hámster", points: 6 }
    ]
  },
  {
    id: 37,
    category: "Vacaciones",
    question: "Menciona algo que la gente hace en sus vacaciones.",
    answers: [
      { text: "Ir a la playa", points: 32 },
      { text: "Viajar y conocer lugares", points: 25 },
      { text: "Descansar en casa", points: 18 },
      { text: "Visitar a la familia", points: 15 },
      { text: "Ir a la montaña", points: 10 }
    ]
  },
  {
    id: 38,
    category: "Clima",
    question: "Nombra algo que usas cuando llueve.",
    answers: [
      { text: "Paraguas", points: 42 },
      { text: "Impermeable / chubasquero", points: 26 },
      { text: "Botas", points: 16 },
      { text: "Gorro o capucha", points: 10 },
      { text: "Chamarra / chaqueta", points: 6 }
    ]
  },
  {
    id: 39,
    category: "El Hogar",
    question: "Nombra un aparato que hay en casi todas las casas.",
    answers: [
      { text: "Refrigerador", points: 30 },
      { text: "Televisión", points: 26 },
      { text: "Licuadora", points: 18 },
      { text: "Lavadora", points: 16 },
      { text: "Microondas", points: 10 }
    ]
  },
  {
    id: 40,
    category: "Para los Niños",
    question: "Nombra algo dulce que a los niños les encanta.",
    answers: [
      { text: "Chocolate", points: 32 },
      { text: "Dulces / caramelos", points: 25 },
      { text: "Helado", points: 20 },
      { text: "Galletas", points: 15 },
      { text: "Chicle", points: 8 }
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
