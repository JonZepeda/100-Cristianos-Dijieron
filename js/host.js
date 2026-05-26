// LÓGICA DE LA CONSOLA DEL PRESENTADOR (HOST)

// Inicializar canal de comunicación
const bc = new BroadcastChannel('cristianos_dijeron_channel');

// Estado del Juego
let gameState = {
  teamA: { name: 'GRUPO A', score: 0 },
  teamB: { name: 'GRUPO B', score: 0 },
  activeTeam: null, // 'A', 'B' o null
  currentRound: 1,
  multiplier: 1,
  roundAccumulated: 0,
  currentQuestion: null,
  revealedAnswers: [] // Array de booleanos
};

// Estado del Dinero Rápido (Fast Money)
let fastMoneyState = {
  show: false,
  timerDuration: 20,
  player1: {
    answers: Array.from({ length: 5 }, () => ({ text: '', points: 0, revealed: false, ptsRevealed: false })),
    total: 0
  },
  player2: {
    answers: Array.from({ length: 5 }, () => ({ text: '', points: 0, revealed: false, ptsRevealed: false })),
    total: 0
  },
  grandTotal: 0
};

// Control del Reloj del Dinero Rápido
let fastTimerInterval = null;
let fastTimerSeconds = 20;

// Referencias a elementos del DOM de Host
const connectionBadge = document.getElementById('connection-badge');
const teamANameInput = document.getElementById('team-a-input-name');
const teamBNameInput = document.getElementById('team-b-input-name');
const teamAScoreVal = document.getElementById('team-a-score-val');
const teamBScoreVal = document.getElementById('team-b-score-val');
const roundSelect = document.getElementById('round-select');
const accumulatedDisplay = document.getElementById('accumulated-display');
const questionSelectDb = document.getElementById('question-select-db');
const activeQuestionLbl = document.getElementById('active-question-lbl');
const hostAnswersContainer = document.getElementById('host-answers-list-container');
const dbEditorModal = document.getElementById('db-editor-modal');
const editorQuestionsList = document.getElementById('editor-questions-list');
const fastTimerDisplay = document.getElementById('fast-timer-display');

// Contenedores del Dinero Rápido
const p1InputsContainer = document.getElementById('p1-inputs-container');
const p2InputsContainer = document.getElementById('p2-inputs-container');

// Inicializar la Consola
window.addEventListener('DOMContentLoaded', () => {
  loadQuestionDatabaseSelect();
  buildFastMoneyRowsInputs();
  pingBoard();
  syncState();

  // Escuchar respuestas de conexión del Tablero
  bc.onmessage = function (event) {
    if (event.data.type === 'BOARD_CONNECTED') {
      connectionBadge.textContent = "Proyector Conectado";
      connectionBadge.className = "connection-status connected";
    }
  };

  // Habilitar audio con cualquier clic en la consola
  document.addEventListener('click', () => {
    if (window.sounds) {
      window.sounds.init();
    }
  }, { once: true });
});

// Enviar señal periódica para detectar si el proyector se abre
function pingBoard() {
  bc.postMessage({ type: 'CONNECT_HOST' });
  setTimeout(pingBoard, 2000);
}

// Abrir el proyector en una pestaña secundaria
function openBoardTab() {
  window.open('board.html', '_blank');
}

// Cargar preguntas en el selector dropdown
function loadQuestionDatabaseSelect() {
  questionSelectDb.innerHTML = '';
  // window.gameQuestions está cargado desde database.js
  window.gameQuestions.forEach(q => {
    const opt = document.createElement('option');
    opt.value = q.id;
    opt.textContent = `[${q.category}] ${q.question}`;
    questionSelectDb.appendChild(opt);
  });
}

// Sincronizar el estado del host con la pantalla de proyección
function syncState() {
  gameState.teamA.name = teamANameInput.value || "GRUPO A";
  gameState.teamA.score = parseInt(teamAScoreVal.value) || 0;
  gameState.teamB.name = teamBNameInput.value || "GRUPO B";
  gameState.teamB.score = parseInt(teamBScoreVal.value) || 0;
  gameState.currentRound = parseInt(roundSelect.value) || 1;

  // Ajustar multiplicadores automáticamente por ronda
  if (gameState.currentRound === 1) gameState.multiplier = 1;
  else if (gameState.currentRound === 2) gameState.multiplier = 2;
  else gameState.multiplier = 3;

  // Actualizar UI local de acumulados
  accumulatedDisplay.textContent = padScore(gameState.roundAccumulated);

  // Resaltar visualmente qué panel de equipo está en turno
  const panelA = document.getElementById('host-team-a-panel');
  const panelB = document.getElementById('host-team-b-panel');
  
  if (gameState.activeTeam === 'A') {
    panelA.classList.add('active');
    panelB.classList.remove('active');
  } else if (gameState.activeTeam === 'B') {
    panelA.classList.remove('active');
    panelB.classList.add('active');
  } else {
    panelA.classList.remove('active');
    panelB.classList.remove('active');
  }

  // Enviar estado al tablero
  bc.postMessage({
    type: 'UPDATE_GAME_STATE',
    data: gameState
  });
}

// Modificar puntuaciones manualmente (+10, -10, etc)
function modifyScore(team, offset) {
  if (team === 'A') {
    let score = parseInt(teamAScoreVal.value) || 0;
    teamAScoreVal.value = Math.max(0, score + offset);
  } else {
    let score = parseInt(teamBScoreVal.value) || 0;
    teamBScoreVal.value = Math.max(0, score + offset);
  }
  syncState();
}

// Cambiar la ronda activa
function onRoundChange() {
  syncState();
}

// Seleccionar el turno del equipo activo
function setActiveTeam(team) {
  if (gameState.activeTeam === team) {
    gameState.activeTeam = null; // Quitar selección
  } else {
    gameState.activeTeam = team;
  }
  syncState();
}

// Formateo de marcadores a 3 dígitos
function padScore(val) {
  const num = parseInt(val) || 0;
  if (num < 10) return `00${num}`;
  if (num < 100) return `0${num}`;
  return `${num}`;
}

// Cargar la pregunta seleccionada del selector al juego activo
function loadSelectedQuestion() {
  const qId = parseInt(questionSelectDb.value);
  const question = window.gameQuestions.find(q => q.id === qId);
  if (!question) return;

  // Configurar estado
  gameState.currentQuestion = JSON.parse(JSON.stringify(question)); // clonar
  gameState.revealedAnswers = Array(question.answers.length).fill(false);
  gameState.roundAccumulated = 0;
  gameState.activeTeam = null; // Limpiar turnos al cambiar pregunta

  // Actualizar etiqueta local
  activeQuestionLbl.textContent = `[${question.category}] ${question.question}`;

  // Renderizar las respuestas en el panel del presentador
  renderHostAnswersList();
  
  // Limpiar panel de strikes del presentador si fuera necesario
  syncState();
}

// Renderizar respuestas en la consola del presentador (con botones de revelar)
function renderHostAnswersList() {
  hostAnswersContainer.innerHTML = '';

  if (!gameState.currentQuestion) return;

  gameState.currentQuestion.answers.forEach((ans, index) => {
    const isRev = gameState.revealedAnswers[index];
    const rowHtml = `
      <div class="host-answer-row ${isRev ? 'revealed' : ''}">
        <span class="host-ans-text">${ans.text}</span>
        <span class="host-ans-pts">${ans.points} pts</span>
        <div>
          <button class="btn-reveal-card ${isRev ? 'revealed-active' : 'not-revealed'}" 
                  id="btn-rev-${index}" 
                  onclick="revealAnswerOnBoard(${index})">
            ${isRev ? 'REVELADA' : 'REVELAR'}
          </button>
        </div>
      </div>
    `;
    hostAnswersContainer.insertAdjacentHTML('beforeend', rowHtml);
  });
}

// Revelar una respuesta en el tablero
function revealAnswerOnBoard(index) {
  if (!gameState.currentQuestion || gameState.revealedAnswers[index]) return;

  // Actualizar estado local
  gameState.revealedAnswers[index] = true;
  
  const ans = gameState.currentQuestion.answers[index];
  
  // Enviar señal de revelación y sonido al tablero
  bc.postMessage({
    type: 'REVEAL_ANSWER',
    data: {
      index: index,
      answer: ans.text,
      points: ans.points
    }
  });

  // Calcular nuevos puntos acumulados en la ronda (puntos x multiplicador)
  let sumRevealed = 0;
  gameState.revealedAnswers.forEach((isRev, i) => {
    if (isRev) {
      sumRevealed += gameState.currentQuestion.answers[i].points;
    }
  });
  gameState.roundAccumulated = sumRevealed * gameState.multiplier;

  // Sonido local para el host
  if (window.sounds) {
    window.sounds.playCorrect();
  }

  // Refrescar paneles
  renderHostAnswersList();
  syncState();
}

// Asignar los puntos acumulados de la ronda a un equipo
function assignAccumulatedTo(team) {
  if (gameState.roundAccumulated === 0) return;

  if (team === 'A') {
    let cur = parseInt(teamAScoreVal.value) || 0;
    teamAScoreVal.value = cur + gameState.roundAccumulated;
  } else {
    let cur = parseInt(teamBScoreVal.value) || 0;
    teamBScoreVal.value = cur + gameState.roundAccumulated;
  }

  // Reiniciar acumulados y turnos
  gameState.roundAccumulated = 0;
  gameState.activeTeam = null;
  
  if (window.sounds) {
    window.sounds.playWin();
  }

  syncState();
}

function clearAccumulated() {
  gameState.roundAccumulated = 0;
  syncState();
}

// Enviar strikes (X rojas)
function triggerStrike(count) {
  bc.postMessage({
    type: 'SHOW_STRIKES',
    data: { count: count }
  });
  
  // Reproducir localmente el sonido buzzer
  if (window.sounds) {
    window.sounds.playWrong();
  }
}

// Reproducir sonidos dinámicos manualmente
function playHostSound(soundName) {
  bc.postMessage({
    type: 'PLAY_SOUND',
    data: { soundName: soundName }
  });

  if (window.sounds) {
    if (soundName === 'correct') window.sounds.playCorrect();
    else if (soundName === 'wrong') window.sounds.playWrong();
    else if (soundName === 'win') window.sounds.playWin();
    else if (soundName === 'tick') window.sounds.playTick();
  }
}

// Resetear por completo el juego a valores iniciales de forma segura
function resetFullGame() {
  if (!confirm("¿Seguro que deseas reiniciar todo el juego, incluyendo puntuaciones?")) return;

  if (teamAScoreVal) teamAScoreVal.value = "0";
  if (teamBScoreVal) teamBScoreVal.value = "0";
  if (teamANameInput) teamANameInput.value = "GRUPO A";
  if (teamBNameInput) teamBNameInput.value = "GRUPO B";
  if (roundSelect) roundSelect.value = "1";
  
  gameState.teamA = { name: 'GRUPO A', score: 0 };
  gameState.teamB = { name: 'GRUPO B', score: 0 };
  gameState.activeTeam = null;
  gameState.currentRound = 1;
  gameState.multiplier = 1;
  gameState.roundAccumulated = 0;
  gameState.currentQuestion = null;
  gameState.revealedAnswers = [];

  if (activeQuestionLbl) {
    activeQuestionLbl.textContent = "Ninguna pregunta cargada. Por favor, selecciona una pregunta arriba y presiona \"Cargar\".";
  }
  if (hostAnswersContainer) {
    hostAnswersContainer.innerHTML = '';
  }
  
  resetFastMoneyState();
  syncState();
}


/* DINERO RÁPIDO - LÓGICA DE CONTROL DEL HOST */

function toggleFastMoneyBoard(show) {
  fastMoneyState.show = show;
  bc.postMessage({
    type: 'FAST_MONEY_TOGGLE',
    data: { show: show }
  });
  syncFastMoney();
}

// Construir dinámicamente las entradas del Dinero Rápido en la consola
function buildFastMoneyRowsInputs() {
  p1InputsContainer.innerHTML = '';
  p2InputsContainer.innerHTML = '';

  for (let i = 0; i < 5; i++) {
    // Jugador 1
    const p1Row = `
      <div class="fast-row-input">
        <input type="text" placeholder="Respuesta ${i+1}" id="p1-ans-${i}" onchange="updateFastAnswers()">
        <input type="number" placeholder="Pts" id="p1-pts-${i}" onchange="updateFastAnswers()" style="width:70px">
        <div class="fast-reveal-buttons-group">
          <button class="btn-fast-reveal btn-reveal-ans" id="p1-btn-ans-${i}" onclick="toggleFastReveal('player1', ${i}, 'text')">Ans</button>
          <button class="btn-fast-reveal btn-reveal-pts" id="p1-btn-pts-${i}" onclick="toggleFastReveal('player1', ${i}, 'points')">Pts</button>
        </div>
      </div>
    `;
    p1InputsContainer.insertAdjacentHTML('beforeend', p1Row);

    // Jugador 2
    const p2Row = `
      <div class="fast-row-input">
        <input type="text" placeholder="Respuesta ${i+1}" id="p2-ans-${i}" onchange="updateFastAnswers()">
        <input type="number" placeholder="Pts" id="p2-pts-${i}" onchange="updateFastAnswers()" style="width:70px">
        <div class="fast-reveal-buttons-group">
          <button class="btn-fast-reveal btn-reveal-ans" id="p2-btn-ans-${i}" onclick="toggleFastReveal('player2', ${i}, 'text')">Ans</button>
          <button class="btn-fast-reveal btn-reveal-pts" id="p2-btn-pts-${i}" onclick="toggleFastReveal('player2', ${i}, 'points')">Pts</button>
        </div>
      </div>
    `;
    p2InputsContainer.insertAdjacentHTML('beforeend', p2Row);
  }
}

// Capturar las entradas de texto y puntos y recalcular totales
function updateFastAnswers() {
  // Jugador 1
  let p1Sum = 0;
  for (let i = 0; i < 5; i++) {
    const textVal = document.getElementById(`p1-ans-${i}`).value;
    const ptsVal = parseInt(document.getElementById(`p1-pts-${i}`).value) || 0;
    
    fastMoneyState.player1.answers[i].text = textVal;
    fastMoneyState.player1.answers[i].points = ptsVal;
    
    // Sumar solo si los puntos ya han sido revelados en pantalla
    if (fastMoneyState.player1.answers[i].ptsRevealed) {
      p1Sum += ptsVal;
    }
  }
  fastMoneyState.player1.total = p1Sum;

  // Jugador 2
  let p2Sum = 0;
  for (let i = 0; i < 5; i++) {
    const textVal = document.getElementById(`p2-ans-${i}`).value;
    const ptsVal = parseInt(document.getElementById(`p2-pts-${i}`).value) || 0;
    
    fastMoneyState.player2.answers[i].text = textVal;
    fastMoneyState.player2.answers[i].points = ptsVal;

    // Sumar solo si los puntos ya han sido revelados en pantalla
    if (fastMoneyState.player2.answers[i].ptsRevealed) {
      p2Sum += ptsVal;
    }
  }
  fastMoneyState.player2.total = p2Sum;

  fastMoneyState.grandTotal = p1Sum + p2Sum;
  
  syncFastMoney();
}

// Alternar la revelación de la respuesta o los puntos en el tablero de proyección
function toggleFastReveal(player, index, mode) {
  const ansObj = fastMoneyState[player].answers[index];
  
  if (mode === 'text') {
    ansObj.revealed = !ansObj.revealed;
    const btn = document.getElementById(`${player === 'player1' ? 'p1' : 'p2'}-btn-ans-${index}`);
    btn.classList.toggle('active', ansObj.revealed);
  } else {
    ansObj.ptsRevealed = !ansObj.ptsRevealed;
    const btn = document.getElementById(`${player === 'player1' ? 'p1' : 'p2'}-btn-pts-${index}`);
    btn.classList.toggle('active', ansObj.ptsRevealed);
    
    // El sonido ding! al revelar los puntos
    if (ansObj.ptsRevealed && window.sounds) {
      window.sounds.playCorrect();
    }
  }

  // Si se revelan los puntos, la respuesta debe marcarse como revelada también
  if (ansObj.ptsRevealed) {
    ansObj.revealed = true;
    const btnAns = document.getElementById(`${player === 'player1' ? 'p1' : 'p2'}-btn-ans-${index}`);
    btnAns.classList.add('active');
  }

  updateFastAnswers();
}

// Sincronizar el estado del dinero rápido con el tablero de proyección
function syncFastMoney() {
  bc.postMessage({
    type: 'FAST_MONEY_STATE',
    data: fastMoneyState
  });
}

// Controladores del cronómetro de Dinero Rápido
function startFastTimer(customSecs) {
  clearInterval(fastTimerInterval);
  
  fastTimerSeconds = customSecs || 20;
  fastTimerDisplay.textContent = `${fastTimerSeconds} s`;
  
  // Sincronizar tick inicial
  bc.postMessage({ type: 'FAST_MONEY_TICK', data: { time: fastTimerSeconds } });

  fastTimerInterval = setInterval(() => {
    fastTimerSeconds--;
    if (fastTimerSeconds < 0) {
      clearInterval(fastTimerInterval);
      fastTimerDisplay.textContent = "¡Tiempo!";
    } else {
      fastTimerDisplay.textContent = `${fastTimerSeconds} s`;
      // Enviar tick
      bc.postMessage({ type: 'FAST_MONEY_TICK', data: { time: fastTimerSeconds } });
      
      // Reproducir sonido local
      if (window.sounds) {
        window.sounds.playTick();
      }
    }
  }, 1000);
}

function stopFastTimer() {
  clearInterval(fastTimerInterval);
}

function resetFastTimer() {
  clearInterval(fastTimerInterval);
  fastTimerSeconds = 20;
  fastTimerDisplay.textContent = "20 s";
  bc.postMessage({ type: 'FAST_MONEY_TICK', data: { time: 20 } });
}

// Reiniciar el estado de Dinero Rápido
function resetFastMoneyState() {
  clearInterval(fastTimerInterval);
  fastTimerSeconds = 20;
  if (fastTimerDisplay) {
    fastTimerDisplay.textContent = "20 s";
  }

  fastMoneyState = {
    show: fastMoneyState.show,
    timerDuration: 20,
    player1: {
      answers: Array.from({ length: 5 }, () => ({ text: '', points: 0, revealed: false, ptsRevealed: false })),
      total: 0
    },
    player2: {
      answers: Array.from({ length: 5 }, () => ({ text: '', points: 0, revealed: false, ptsRevealed: false })),
      total: 0
    },
    grandTotal: 0
  };

  // Limpiar inputs del DOM de forma segura
  for (let i = 0; i < 5; i++) {
    const p1Ans = document.getElementById(`p1-ans-${i}`);
    if (p1Ans) p1Ans.value = '';
    
    const p1Pts = document.getElementById(`p1-pts-${i}`);
    if (p1Pts) p1Pts.value = '';
    
    const p2Ans = document.getElementById(`p2-ans-${i}`);
    if (p2Ans) p2Ans.value = '';
    
    const p2Pts = document.getElementById(`p2-pts-${i}`);
    if (p2Pts) p2Pts.value = '';

    const p1BtnAns = document.getElementById(`p1-btn-ans-${i}`);
    if (p1BtnAns) p1BtnAns.classList.remove('active');
    
    const p1BtnPts = document.getElementById(`p1-btn-pts-${i}`);
    if (p1BtnPts) p1BtnPts.classList.remove('active');
    
    const p2BtnAns = document.getElementById(`p2-btn-ans-${i}`);
    if (p2BtnAns) p2BtnAns.classList.remove('active');
    
    const p2BtnPts = document.getElementById(`p2-btn-pts-${i}`);
    if (p2BtnPts) p2BtnPts.classList.remove('active');
  }

  syncFastMoney();
}


/* MODAL Y EDITOR DE BASE DE DATOS DE PREGUNTAS */

function openDatabaseEditor() {
  dbEditorModal.classList.add('active');
  renderEditorQuestionsList();
}

function closeDatabaseEditor() {
  dbEditorModal.classList.remove('active');
}

// Renderizar la lista de preguntas actuales dentro del editor
function renderEditorQuestionsList() {
  editorQuestionsList.innerHTML = '';
  
  window.gameQuestions.forEach((q, index) => {
    const qHtml = `
      <div class="db-q-item">
        <div class="db-q-item-info">
          <span class="db-q-cat">${q.category}</span>
          <span class="db-q-title">${q.question}</span>
        </div>
        <button class="btn-delete-q" onclick="deleteQuestion(${q.id})">Borrar</button>
      </div>
    `;
    editorQuestionsList.insertAdjacentHTML('beforeend', qHtml);
  });
}

// Guardar una nueva pregunta ingresada en el editor
function saveNewQuestion() {
  const category = document.getElementById('new-q-category').value.trim();
  const qText = document.getElementById('new-q-text').value.trim();

  if (!category || !qText) {
    alert("Por favor, rellene la categoría y la pregunta.");
    return;
  }

  // Recolectar respuestas y puntuaciones
  const answers = [];
  for (let i = 1; i <= 5; i++) {
    const ansText = document.getElementById(`new-q-a${i}`).value.trim();
    const ansPts = parseInt(document.getElementById(`new-q-p${i}`).value) || 0;
    
    if (ansText) {
      answers.push({ text: ansText, points: ansPts });
    }
  }

  if (answers.length === 0) {
    alert("Debe agregar al menos una respuesta válida de encuesta.");
    return;
  }

  // Generar ID único
  const newId = window.gameQuestions.length > 0 
    ? Math.max(...window.gameQuestions.map(q => q.id)) + 1 
    : 1;

  const newQuestion = {
    id: newId,
    category: category,
    question: qText,
    answers: answers
  };

  // Guardar en array y guardar en LocalStorage
  window.gameQuestions.push(newQuestion);
  saveQuestions(window.gameQuestions);

  // Limpiar formulario
  document.getElementById('new-q-category').value = '';
  document.getElementById('new-q-text').value = '';
  for (let i = 1; i <= 5; i++) {
    document.getElementById(`new-q-a${i}`).value = '';
    document.getElementById(`new-q-p${i}`).value = '';
  }

  // Actualizar UI
  renderEditorQuestionsList();
  loadQuestionDatabaseSelect();
  alert("¡Pregunta guardada con éxito en tu base de datos local!");
}

// Borrar pregunta
function deleteQuestion(id) {
  if (!confirm("¿Seguro que deseas eliminar esta pregunta de la base de datos?")) return;

  window.gameQuestions = window.gameQuestions.filter(q => q.id !== id);
  saveQuestions(window.gameQuestions);

  renderEditorQuestionsList();
  loadQuestionDatabaseSelect();
}
