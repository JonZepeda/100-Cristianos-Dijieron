// LÓGICA DEL TABLERO DE PROYECCIÓN (PÚBLICO)

// Inicializar el canal de comunicación local
const bc = new BroadcastChannel('cristianos_dijeron_channel');

// Referencias a elementos del DOM
const roundIndicator = document.getElementById('round-indicator');
const accumulatedPoints = document.getElementById('accumulated-points');
const questionText = document.getElementById('question-text');
const cardsContainer = document.getElementById('board-cards-container');

const teamANameEl = document.getElementById('team-a-name');
const teamAScoreEl = document.getElementById('team-a-score');
const teamAPanel = document.getElementById('team-a-panel');
const teamAIndicator = document.getElementById('team-a-indicator');

const teamBNameEl = document.getElementById('team-b-name');
const teamBScoreEl = document.getElementById('team-b-score');
const teamBPanel = document.getElementById('team-b-panel');
const teamBIndicator = document.getElementById('team-b-indicator');

// Overlay de Strikes
const strikesOverlay = document.getElementById('strikes-overlay');
const strikesWrapper = document.getElementById('strikes-wrapper');

// Overlay Dinero Rápido
const fastMoneyOverlay = document.getElementById('fast-money-overlay');
const fastMoneyTimer = document.getElementById('fast-money-timer');
const p1RowsContainer = document.getElementById('player-1-rows');
const p2RowsContainer = document.getElementById('player-2-rows');
const p1TotalEl = document.getElementById('p1-total');
const p2TotalEl = document.getElementById('p2-total');
const fastGrandTotalEl = document.getElementById('fast-grand-total');

// Estado interno para renderizar
let activeAnswers = [];

// Escuchar los mensajes provenientes de la Consola del Presentador (Host)
bc.onmessage = function (event) {
  const { type, data } = event.data;
  console.log("Mensaje recibido del Host:", type, data);

  switch (type) {
    case 'CONNECT_HOST':
      // Confirmar conexión al presentador
      bc.postMessage({ type: 'BOARD_CONNECTED' });
      break;

    case 'UPDATE_GAME_STATE':
      updateGameState(data);
      break;

    case 'REVEAL_ANSWER':
      revealAnswer(data.index, data.answer, data.points);
      break;

    case 'SHOW_STRIKES':
      triggerStrikes(data.count);
      break;

    case 'PLAY_SOUND':
      triggerSound(data.soundName);
      break;

    case 'FAST_MONEY_TOGGLE':
      toggleFastMoney(data.show);
      break;

    case 'FAST_MONEY_STATE':
      updateFastMoneyState(data);
      break;

    case 'FAST_MONEY_TICK':
      updateFastMoneyTimer(data.time);
      break;

    default:
      console.warn("Tipo de mensaje desconocido:", type);
  }
};

// Formatear números a 3 dígitos (ej: 5 -> 005)
function padScore(val) {
  const num = parseInt(val) || 0;
  if (num < 10) return `00${num}`;
  if (num < 100) return `0${num}`;
  return `${num}`;
}

// Actualizar el estado global del tablero
function updateGameState(state) {
  // 1. Nombres y Puntajes de Equipos
  teamANameEl.textContent = state.teamA.name || "GRUPO A";
  teamAScoreEl.textContent = padScore(state.teamA.score);
  teamBNameEl.textContent = state.teamB.name || "GRUPO B";
  teamBScoreEl.textContent = padScore(state.teamB.score);

  // 2. Panel Activo / Indicador de Turno
  if (state.activeTeam === 'A') {
    teamAPanel.classList.add('active');
    teamBPanel.classList.remove('active');
    teamAIndicator.textContent = "JUGANDO";
    teamBIndicator.textContent = "ESPERANDO";
  } else if (state.activeTeam === 'B') {
    teamAPanel.classList.remove('active');
    teamBPanel.classList.add('active');
    teamAIndicator.textContent = "ESPERANDO";
    teamBIndicator.textContent = "JUGANDO";
  } else {
    teamAPanel.classList.remove('active');
    teamBPanel.classList.remove('active');
    teamAIndicator.textContent = "LISTO";
    teamBIndicator.textContent = "LISTO";
  }

  // 3. Ronda y Puntos en Juego
  roundIndicator.textContent = `RONDA ${state.currentRound} (x${state.multiplier})`;
  accumulatedPoints.textContent = padScore(state.roundAccumulated);

  // 4. Pregunta Activa
  if (state.currentQuestion) {
    questionText.textContent = state.currentQuestion.question;
    
    // Si cambiaron las respuestas (nueva ronda), renderizar el tablero vacío
    if (JSON.stringify(activeAnswers) !== JSON.stringify(state.currentQuestion.answers)) {
      activeAnswers = state.currentQuestion.answers;
      renderEmptyCards(activeAnswers.length);
    }
  } else {
    questionText.textContent = "¡Bienvenidos! Esperando la primera pregunta del presentador...";
    cardsContainer.innerHTML = '';
    activeAnswers = [];
  }
}

// Renderizar tarjetas ocultas metálicas
function renderEmptyCards(count) {
  cardsContainer.innerHTML = '';
  // Siempre creamos un número fijo de casillas (entre 5 y 8) para que el tablero se vea simétrico
  const totalSlots = Math.max(6, count);
  
  for (let i = 0; i < totalSlots; i++) {
    const cardHtml = `
      <div class="card-container" id="card-${i}">
        <div class="card-inner">
          <div class="card-front">
            <span class="card-index">${i + 1}</span>
          </div>
          <div class="card-back">
            <span class="card-text">---</span>
            <span class="card-points">0</span>
          </div>
        </div>
      </div>
    `;
    cardsContainer.insertAdjacentHTML('beforeend', cardHtml);
  }
}

// Revelar una respuesta por su índice
function revealAnswer(index, answerText, points) {
  const card = document.getElementById(`card-${index}`);
  if (!card) return;

  const cardInner = card.querySelector('.card-inner');
  const textEl = card.querySelector('.card-text');
  const pointsEl = card.querySelector('.card-points');

  // Rellenar valores antes de voltear
  textEl.textContent = answerText;
  pointsEl.textContent = points;

  // Si no está ya volteada, reproducir sonido y voltear en 3D
  if (!card.classList.contains('revealed')) {
    card.classList.add('revealed');
    if (window.sounds) {
      window.sounds.playCorrect();
    }
  }
}

// Disparar la animación y sonido de los Strikes (Las X Rojas)
function triggerStrikes(count) {
  if (!count || count < 1 || count > 3) return;

  // Limpiar strikes anteriores
  strikesWrapper.innerHTML = '';

  // Agregar las X dinámicamente
  for (let i = 0; i < count; i++) {
    const xSpan = document.createElement('span');
    xSpan.className = 'strike-x';
    xSpan.textContent = 'X';
    
    // Pequeño retardo escalonado de aparición para el efecto dramático
    xSpan.style.transitionDelay = `${i * 120}ms`;
    strikesWrapper.appendChild(xSpan);
  }

  // Activar overlay y sacudir pantalla
  strikesOverlay.classList.add('active');
  
  // Audio de zumbador
  if (window.sounds) {
    window.sounds.playWrong();
  }

  // Ocultar automáticamente después de 1.4 segundos
  setTimeout(() => {
    strikesOverlay.classList.remove('active');
  }, 1400);
}

// Reproducir un sonido de manera explícita
function triggerSound(soundName) {
  if (!window.sounds) return;
  
  if (soundName === 'correct') window.sounds.playCorrect();
  else if (soundName === 'wrong') window.sounds.playWrong();
  else if (soundName === 'win') window.sounds.playWin();
  else if (soundName === 'tick') window.sounds.playTick();
}

/* DINERO RÁPIDO - LÓGICA DE ACTUALIZACIÓN */

function toggleFastMoney(show) {
  if (show) {
    fastMoneyOverlay.classList.add('active');
    if (window.sounds) window.sounds.playWin();
  } else {
    fastMoneyOverlay.classList.remove('active');
  }
}

// Inicializar y actualizar las filas del Dinero Rápido
function updateFastMoneyState(data) {
  const { player1, player2, grandTotal } = data;

  // Renderizar filas de Jugador 1
  renderFastPlayerRows(p1RowsContainer, player1.answers);
  p1TotalEl.textContent = player1.total;

  // Renderizar filas de Jugador 2
  renderFastPlayerRows(p2RowsContainer, player2.answers);
  p2TotalEl.textContent = player2.total;

  // Total global acumulado
  fastGrandTotalEl.textContent = grandTotal;
}

function renderFastPlayerRows(container, answers) {
  container.innerHTML = '';
  
  // Siempre renderizamos 5 filas de juego
  for (let i = 0; i < 5; i++) {
    const ansObj = answers[i] || { text: '', points: '', revealed: false, ptsRevealed: false };
    
    const rowHtml = `
      <div class="fast-row">
        <div class="fast-ans-box">${ansObj.revealed ? ansObj.text : ''}</div>
        <div class="fast-pts-box ${ansObj.ptsRevealed ? 'revealed' : ''}">
          ${ansObj.ptsRevealed ? (ansObj.points === 0 || ansObj.points ? ansObj.points : '0') : ''}
        </div>
      </div>
    `;
    container.insertAdjacentHTML('beforeend', rowHtml);
  }
}

// Control del cronómetro del dinero rápido
function updateFastMoneyTimer(time) {
  fastMoneyTimer.textContent = time;
  
  if (time > 0) {
    if (window.sounds) {
      window.sounds.playTick();
    }
  } else {
    // Si el tiempo llega a 0, suena el zumbador de strike
    if (window.sounds) {
      window.sounds.playWrong();
    }
  }
}

// Inicializar el contexto de sonido con interacción del usuario
document.addEventListener('click', () => {
  if (window.sounds) {
    window.sounds.init();
    console.log("Audio del Tablero desbloqueado con éxito.");
  }
}, { once: true });

// Auto-conectar con el host al abrir la pestaña
setTimeout(() => {
  bc.postMessage({ type: 'BOARD_CONNECTED' });
}, 500);
