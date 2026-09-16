// LÓGICA DE LA CONSOLA DEL PRESENTADOR (HOST) - EDICIÓN ESTUDIO TV

// Canal de comunicación con el proyector
const bc = new BroadcastChannel('cristianos_dijeron_channel');

// Clave de almacenamiento de respaldo en caso de recarga
const STORAGE_GAME_STATE_KEY = 'cristianos_dijeron_active_state';

// Estado del Juego Principal
let gameState = {
  teamA: { name: 'GRUPO A', score: 0 },
  teamB: { name: 'GRUPO B', score: 0 },
  activeTeam: null, // 'A', 'B' o null
  currentRound: 1,
  multiplier: 1,
  roundAccumulated: 0,
  currentQuestion: null,
  revealedAnswers: []
};

// Estado del Dinero Rápido (Fast Money)
let fastMoneyState = {
  show: false,
  timerDuration: 20,
  selectedSetId: 'set-1',
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

// Variables del Reloj de Dinero Rápido
let fastTimerInterval = null;
let fastTimerSeconds = 20;

// Referencias al DOM
const connectionBadge = document.getElementById('connection-badge');
const teamANameInput = document.getElementById('team-a-input-name');
const teamBNameInput = document.getElementById('team-b-input-name');
const teamAScoreVal = document.getElementById('team-a-score-val');
const teamBScoreVal = document.getElementById('team-b-score-val');
const roundSelect = document.getElementById('round-select');
const accumulatedDisplay = document.getElementById('accumulated-display');

const categoryFilterSelect = document.getElementById('category-filter-select');
const questionSearchInput = document.getElementById('question-search-input');
const questionSelectDb = document.getElementById('question-select-db');
const activeQuestionLbl = document.getElementById('active-question-lbl');
const activeCategoryPill = document.getElementById('active-category-pill');
const hostAnswersContainer = document.getElementById('host-answers-list-container');
const totalQCountEl = document.getElementById('total-q-count');

const dbEditorModal = document.getElementById('db-editor-modal');
const modalQCountEl = document.getElementById('modal-q-count');
const editorQuestionsList = document.getElementById('editor-questions-list');
const newQAnswersContainer = document.getElementById('new-q-answers-container');
const hotkeysModal = document.getElementById('hotkeys-modal');

const fastTimerDisplay = document.getElementById('fast-timer-display');
const fastSetSelect = document.getElementById('fast-set-select');
const fastScriptBox = document.getElementById('fast-questions-script-box');
const p1InputsContainer = document.getElementById('p1-inputs-container');
const p2InputsContainer = document.getElementById('p2-inputs-container');

// Inicialización
window.addEventListener('DOMContentLoaded', () => {
  initNewQuestionEditorRows();
  populateCategoryFilter();
  loadQuestionDatabaseSelect();
  populateFastSetSelect();
  buildFastMoneyRowsInputs();
  renderFastScriptBox();
  updateQuestionCounters();

  // Intentar restaurar estado previo si hubo recarga accidental
  restoreSavedGameState();

  pingBoard();
  syncState();

  // Escuchar respuestas del Proyector
  bc.onmessage = function (event) {
    if (event.data.type === 'BOARD_CONNECTED') {
      connectionBadge.textContent = "Proyector Conectado";
      connectionBadge.className = "connection-status connected";
    }
  };

  // Inicializar audio con clic
  document.addEventListener('click', () => {
    if (window.sounds) window.sounds.init();
  }, { once: true });

  // Configurar Atajos de Teclado
  setupGlobalHotkeys();
});

// Enviar pulso de conexión periódica
function pingBoard() {
  bc.postMessage({ type: 'CONNECT_HOST' });
  setTimeout(pingBoard, 2000);
}

// Abrir proyector en nueva pestaña
function openBoardTab() {
  window.open('board.html', '_blank');
}

// Control de Volumen y Silencio
function changeHostVolume(val) {
  if (window.sounds) {
    window.sounds.setVolume(val);
  }
}

function toggleHostMute() {
  if (window.sounds) {
    const isMuted = window.sounds.toggleMute();
    const btn = document.getElementById('btn-mute-toggle');
    if (btn) btn.textContent = isMuted ? '🔇' : '🔊';
  }
}

// Cargar categorías en el filtro
function populateCategoryFilter() {
  if (!categoryFilterSelect || !window.getCategories) return;
  const cats = window.getCategories();

  categoryFilterSelect.innerHTML = '<option value="ALL">Todas las Categorías</option>';
  cats.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c;
    opt.textContent = c;
    categoryFilterSelect.appendChild(opt);
  });
}

function onCategoryFilterChange() {
  loadQuestionDatabaseSelect();
}

function onSearchQuestions() {
  loadQuestionDatabaseSelect();
}

// Filtrar y cargar preguntas en el selector
function loadQuestionDatabaseSelect() {
  if (!questionSelectDb) return;
  questionSelectDb.innerHTML = '';

  const selectedCat = categoryFilterSelect ? categoryFilterSelect.value : 'ALL';
  const searchTerm = (questionSearchInput ? questionSearchInput.value : '').toLowerCase().trim();

  const filtered = window.gameQuestions.filter(q => {
    const matchCat = (selectedCat === 'ALL') || (q.category === selectedCat);
    const matchSearch = !searchTerm || 
      q.question.toLowerCase().includes(searchTerm) || 
      (q.category && q.category.toLowerCase().includes(searchTerm));
    return matchCat && matchSearch;
  });

  filtered.forEach(q => {
    const opt = document.createElement('option');
    opt.value = q.id;
    opt.textContent = `[${q.category}] ${q.question}`;
    questionSelectDb.appendChild(opt);
  });

  if (filtered.length === 0) {
    const opt = document.createElement('option');
    opt.value = '';
    opt.textContent = 'No se encontraron preguntas';
    questionSelectDb.appendChild(opt);
  }
}

function updateQuestionCounters() {
  const count = window.gameQuestions ? window.gameQuestions.length : 0;
  if (totalQCountEl) totalQCountEl.textContent = count;
  if (modalQCountEl) modalQCountEl.textContent = count;
}

// Sincronizar el estado del Host con el Proyector y guardar en LocalStorage
function syncState() {
  gameState.teamA.name = teamANameInput.value || "GRUPO A";
  gameState.teamA.score = parseInt(teamAScoreVal.value) || 0;
  gameState.teamB.name = teamBNameInput.value || "GRUPO B";
  gameState.teamB.score = parseInt(teamBScoreVal.value) || 0;
  gameState.currentRound = parseInt(roundSelect.value) || 1;

  if (gameState.currentRound === 1) gameState.multiplier = 1;
  else if (gameState.currentRound === 2) gameState.multiplier = 2;
  else gameState.multiplier = 3;

  accumulatedDisplay.textContent = padScore(gameState.roundAccumulated);

  // Actualizar indicadores de turno en la interfaz del host
  const panelA = document.getElementById('host-team-a-panel');
  const panelB = document.getElementById('host-team-b-panel');
  
  if (panelA && panelB) {
    panelA.classList.toggle('active', gameState.activeTeam === 'A');
    panelB.classList.toggle('active', gameState.activeTeam === 'B');
  }

  // Guardar copia local de respaldo
  try {
    localStorage.setItem(STORAGE_GAME_STATE_KEY, JSON.stringify(gameState));
  } catch (e) {
    console.error("Error guardando estado local", e);
  }

  // Notificar al Tablero del Proyector
  bc.postMessage({
    type: 'UPDATE_GAME_STATE',
    data: gameState
  });
}

function restoreSavedGameState() {
  const saved = localStorage.getItem(STORAGE_GAME_STATE_KEY);
  if (!saved) return;
  try {
    const parsed = JSON.parse(saved);
    if (parsed && parsed.teamA) {
      gameState = parsed;
      if (teamANameInput) teamANameInput.value = gameState.teamA.name;
      if (teamBNameInput) teamBNameInput.value = gameState.teamB.name;
      if (teamAScoreVal) teamAScoreVal.value = gameState.teamA.score;
      if (teamBScoreVal) teamBScoreVal.value = gameState.teamB.score;
      if (roundSelect) roundSelect.value = gameState.currentRound;

      if (gameState.currentQuestion) {
        activeQuestionLbl.textContent = `[${gameState.currentQuestion.category}] ${gameState.currentQuestion.question}`;
        if (activeCategoryPill) activeCategoryPill.textContent = gameState.currentQuestion.category.toUpperCase();
        renderHostAnswersList();
      }
    }
  } catch (e) {
    console.warn("No se pudo restaurar estado previo:", e);
  }
}

// Modificar puntuaciones con botones rápidos
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

function onRoundChange() {
  syncState();
}

function setActiveTeam(team) {
  gameState.activeTeam = (gameState.activeTeam === team) ? null : team;
  syncState();
}

function padScore(val) {
  const num = parseInt(val) || 0;
  if (num < 10) return `00${num}`;
  if (num < 100) return `0${num}`;
  return `${num}`;
}

// Cargar pregunta seleccionada
function loadSelectedQuestion() {
  const qId = parseInt(questionSelectDb.value);
  const question = window.gameQuestions.find(q => q.id === qId);
  if (!question) return;

  loadQuestionIntoGame(question);
}

// Cargar pregunta al azar
function loadRandomQuestion() {
  if (!window.gameQuestions || window.gameQuestions.length === 0) return;
  const randomIndex = Math.floor(Math.random() * window.gameQuestions.length);
  const question = window.gameQuestions[randomIndex];
  loadQuestionIntoGame(question);
}

function loadQuestionIntoGame(question) {
  gameState.currentQuestion = JSON.parse(JSON.stringify(question));
  gameState.revealedAnswers = Array(question.answers.length).fill(false);
  gameState.roundAccumulated = 0;
  gameState.activeTeam = null;

  activeQuestionLbl.textContent = `[${question.category}] ${question.question}`;
  if (activeCategoryPill) activeCategoryPill.textContent = question.category.toUpperCase();

  renderHostAnswersList();
  clearStrikesOnBoard();
  syncState();
}

// Renderizar respuestas en la consola con tecla asignada [1..8]
function renderHostAnswersList() {
  hostAnswersContainer.innerHTML = '';
  if (!gameState.currentQuestion) return;

  gameState.currentQuestion.answers.forEach((ans, index) => {
    const isRev = gameState.revealedAnswers[index];
    const hotkeyNum = index + 1;
    const rowHtml = `
      <div class="host-answer-row ${isRev ? 'revealed' : ''}">
        <span class="host-ans-text">${ans.text}</span>
        <span class="host-ans-pts">${ans.points} pts</span>
        <div>
          <button class="btn-reveal-card ${isRev ? 'revealed-active' : 'not-revealed'}" 
                  id="btn-rev-${index}" 
                  onclick="revealAnswerOnBoard(${index})">
            ${isRev ? '✓ REVELADA' : `REVELAR [${hotkeyNum}]`}
          </button>
        </div>
      </div>
    `;
    hostAnswersContainer.insertAdjacentHTML('beforeend', rowHtml);
  });
}

// Revelar una respuesta en el proyector
function revealAnswerOnBoard(index) {
  if (!gameState.currentQuestion || gameState.revealedAnswers[index]) return;

  gameState.revealedAnswers[index] = true;
  const ans = gameState.currentQuestion.answers[index];

  bc.postMessage({
    type: 'REVEAL_ANSWER',
    data: {
      index: index,
      answer: ans.text,
      points: ans.points
    }
  });

  // Calcular nuevos puntos acumulados
  let sumRevealed = 0;
  gameState.revealedAnswers.forEach((isRev, i) => {
    if (isRev) {
      sumRevealed += gameState.currentQuestion.answers[i].points;
    }
  });
  gameState.roundAccumulated = sumRevealed * gameState.multiplier;

  if (window.sounds) {
    window.sounds.playWhoosh();
    setTimeout(() => window.sounds.playCorrect(), 180);
  }

  renderHostAnswersList();
  syncState();
}

// Asignar puntos acumulados al equipo en turno
function assignAccumulatedTo(team) {
  if (gameState.roundAccumulated === 0) return;

  if (team === 'A') {
    let cur = parseInt(teamAScoreVal.value) || 0;
    teamAScoreVal.value = cur + gameState.roundAccumulated;
  } else {
    let cur = parseInt(teamBScoreVal.value) || 0;
    teamBScoreVal.value = cur + gameState.roundAccumulated;
  }

  gameState.roundAccumulated = 0;
  gameState.activeTeam = null;

  if (window.sounds) {
    window.sounds.playWin();
  }
  
  // Disparar confeti en el proyector
  bc.postMessage({ type: 'TRIGGER_CONFETTI' });

  syncState();
}

function clearAccumulated() {
  gameState.roundAccumulated = 0;
  syncState();
}

// Enviar strikes
function triggerStrike(count) {
  bc.postMessage({
    type: 'SHOW_STRIKES',
    data: { count: count, team: gameState.activeTeam }
  });

  if (window.sounds) {
    window.sounds.playWrong();
  }
}

function clearStrikesOnBoard() {
  bc.postMessage({
    type: 'SHOW_STRIKES',
    data: { count: 0, team: null }
  });
}

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
    else if (soundName === 'whoosh') window.sounds.playWhoosh();
  }
}

function triggerHostConfetti() {
  bc.postMessage({ type: 'TRIGGER_CONFETTI' });
  if (window.sounds) window.sounds.playWin();
}

function resetFullGame() {
  if (!confirm("¿Seguro que deseas reiniciar todo el juego, marcadores y preguntas?")) return;

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
    activeQuestionLbl.textContent = "Ninguna pregunta cargada. Selecciona una pregunta del selector o presiona \"🎲 Azar\" para comenzar.";
  }
  if (activeCategoryPill) activeCategoryPill.textContent = "SIN CATEGORÍA";
  if (hostAnswersContainer) hostAnswersContainer.innerHTML = '';

  resetFastMoneyState();
  clearStrikesOnBoard();
  syncState();
}


/* DINERO RÁPIDO - LÓGICA DEL HOST */

function populateFastSetSelect() {
  if (!fastSetSelect || !window.DEFAULT_FAST_MONEY_SETS) return;
  fastSetSelect.innerHTML = '';
  window.DEFAULT_FAST_MONEY_SETS.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s.id;
    opt.textContent = s.name;
    fastSetSelect.appendChild(opt);
  });
}

function onFastSetChange() {
  renderFastScriptBox();
}

function renderFastScriptBox() {
  if (!fastScriptBox || !window.DEFAULT_FAST_MONEY_SETS) return;
  const setId = fastSetSelect ? fastSetSelect.value : 'set-1';
  const setObj = window.DEFAULT_FAST_MONEY_SETS.find(s => s.id === setId);
  if (!setObj) return;

  fastScriptBox.innerHTML = '';
  setObj.questions.forEach(qText => {
    const item = document.createElement('div');
    item.className = 'fast-script-item';
    item.textContent = qText;
    fastScriptBox.appendChild(item);
  });
}

function toggleFastMoneyBoard(show) {
  fastMoneyState.show = show;
  bc.postMessage({
    type: 'FAST_MONEY_TOGGLE',
    data: { show: show }
  });
  syncFastMoney();
}

function buildFastMoneyRowsInputs() {
  p1InputsContainer.innerHTML = '';
  p2InputsContainer.innerHTML = '';

  for (let i = 0; i < 5; i++) {
    // Jugador 1
    const p1Row = `
      <div class="fast-row-input">
        <input type="text" placeholder="Respuesta ${i+1}" id="p1-ans-${i}" onchange="updateFastAnswers()">
        <input type="number" placeholder="Pts" id="p1-pts-${i}" onchange="updateFastAnswers()">
        <button class="btn-quick-zero" onclick="setFastZero('player1', ${i})" title="0 puntos">0</button>
        <div class="fast-reveal-buttons-group">
          <button class="btn-fast-reveal btn-reveal-ans" id="p1-btn-ans-${i}" onclick="toggleFastReveal('player1', ${i}, 'text')">Resp</button>
          <button class="btn-fast-reveal btn-reveal-pts" id="p1-btn-pts-${i}" onclick="toggleFastReveal('player1', ${i}, 'points')">Pts</button>
        </div>
      </div>
    `;
    p1InputsContainer.insertAdjacentHTML('beforeend', p1Row);

    // Jugador 2
    const p2Row = `
      <div class="fast-row-input">
        <input type="text" placeholder="Respuesta ${i+1}" id="p2-ans-${i}" onchange="updateFastAnswers()">
        <input type="number" placeholder="Pts" id="p2-pts-${i}" onchange="updateFastAnswers()">
        <button class="btn-quick-zero" onclick="setFastZero('player2', ${i})" title="0 puntos">0</button>
        <div class="fast-reveal-buttons-group">
          <button class="btn-fast-reveal btn-reveal-ans" id="p2-btn-ans-${i}" onclick="toggleFastReveal('player2', ${i}, 'text')">Resp</button>
          <button class="btn-fast-reveal btn-reveal-pts" id="p2-btn-pts-${i}" onclick="toggleFastReveal('player2', ${i}, 'points')">Pts</button>
        </div>
      </div>
    `;
    p2InputsContainer.insertAdjacentHTML('beforeend', p2Row);
  }
}

function setFastZero(player, index) {
  const prefix = player === 'player1' ? 'p1' : 'p2';
  const ptsInput = document.getElementById(`${prefix}-pts-${index}`);
  if (ptsInput) {
    ptsInput.value = "0";
    updateFastAnswers();
  }
}

function quickZeroRemaining(player) {
  const prefix = player === 'player1' ? 'p1' : 'p2';
  for (let i = 0; i < 5; i++) {
    const ansInput = document.getElementById(`${prefix}-ans-${i}`);
    const ptsInput = document.getElementById(`${prefix}-pts-${i}`);
    if (ptsInput && !ptsInput.value) {
      ptsInput.value = "0";
    }
  }
  updateFastAnswers();
}

function updateFastAnswers() {
  let p1Sum = 0;
  for (let i = 0; i < 5; i++) {
    const textVal = document.getElementById(`p1-ans-${i}`).value;
    const ptsVal = parseInt(document.getElementById(`p1-pts-${i}`).value) || 0;
    
    fastMoneyState.player1.answers[i].text = textVal;
    fastMoneyState.player1.answers[i].points = ptsVal;
    
    if (fastMoneyState.player1.answers[i].ptsRevealed) {
      p1Sum += ptsVal;
    }
  }
  fastMoneyState.player1.total = p1Sum;

  let p2Sum = 0;
  for (let i = 0; i < 5; i++) {
    const textVal = document.getElementById(`p2-ans-${i}`).value;
    const ptsVal = parseInt(document.getElementById(`p2-pts-${i}`).value) || 0;
    
    fastMoneyState.player2.answers[i].text = textVal;
    fastMoneyState.player2.answers[i].points = ptsVal;

    if (fastMoneyState.player2.answers[i].ptsRevealed) {
      p2Sum += ptsVal;
    }
  }
  fastMoneyState.player2.total = p2Sum;
  fastMoneyState.grandTotal = p1Sum + p2Sum;

  syncFastMoney();
}

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
    
    if (ansObj.ptsRevealed && window.sounds) {
      window.sounds.playCorrect();
    }
  }

  if (ansObj.ptsRevealed) {
    ansObj.revealed = true;
    const btnAns = document.getElementById(`${player === 'player1' ? 'p1' : 'p2'}-btn-ans-${index}`);
    btnAns.classList.add('active');
  }

  updateFastAnswers();
}

function syncFastMoney() {
  bc.postMessage({
    type: 'FAST_MONEY_STATE',
    data: fastMoneyState
  });
}

function startFastTimer(customSecs) {
  clearInterval(fastTimerInterval);
  fastTimerSeconds = customSecs || 20;
  fastTimerDisplay.textContent = `${fastTimerSeconds} s`;

  bc.postMessage({ type: 'FAST_MONEY_TICK', data: { time: fastTimerSeconds } });

  fastTimerInterval = setInterval(() => {
    fastTimerSeconds--;
    if (fastTimerSeconds < 0) {
      clearInterval(fastTimerInterval);
      fastTimerDisplay.textContent = "0 s";
      bc.postMessage({ type: 'FAST_MONEY_TICK', data: { time: 0 } });
      if (window.sounds) window.sounds.playWrong();
    } else {
      fastTimerDisplay.textContent = `${fastTimerSeconds} s`;
      bc.postMessage({ type: 'FAST_MONEY_TICK', data: { time: fastTimerSeconds } });
      if (window.sounds) {
        window.sounds.playTick(fastTimerSeconds <= 5);
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

function resetFastMoneyState() {
  clearInterval(fastTimerInterval);
  fastTimerSeconds = 20;
  if (fastTimerDisplay) fastTimerDisplay.textContent = "20 s";

  fastMoneyState = {
    show: fastMoneyState.show,
    timerDuration: 20,
    selectedSetId: fastMoneyState.selectedSetId,
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


/* MODAL Y EDITOR DE BASE DE DATOS (FLEXIBLE 3-8 RESPUESTAS) */

let dynamicAnswersCount = 5;

function initNewQuestionEditorRows() {
  if (!newQAnswersContainer) return;
  newQAnswersContainer.innerHTML = '';
  for (let i = 1; i <= dynamicAnswersCount; i++) {
    const row = `
      <div class="editor-ans-row" id="editor-row-${i}">
        <span class="editor-ans-idx">${i}</span>
        <input type="text" id="new-q-a${i}" placeholder="Respuesta ${i}">
        <input type="number" id="new-q-p${i}" placeholder="Pts ${i}">
      </div>
    `;
    newQAnswersContainer.insertAdjacentHTML('beforeend', row);
  }
}

function addAnswerRow() {
  if (dynamicAnswersCount >= 8) {
    alert("El límite máximo recomendado para un tablero simétrico es de 8 respuestas.");
    return;
  }
  dynamicAnswersCount++;
  const i = dynamicAnswersCount;
  const row = `
    <div class="editor-ans-row" id="editor-row-${i}">
      <span class="editor-ans-idx">${i}</span>
      <input type="text" id="new-q-a${i}" placeholder="Respuesta ${i}">
      <input type="number" id="new-q-p${i}" placeholder="Pts ${i}">
    </div>
  `;
  newQAnswersContainer.insertAdjacentHTML('beforeend', row);
}

function removeAnswerRow() {
  if (dynamicAnswersCount <= 3) {
    alert("Se requiere un mínimo de 3 respuestas por encuesta.");
    return;
  }
  const row = document.getElementById(`editor-row-${dynamicAnswersCount}`);
  if (row) row.remove();
  dynamicAnswersCount--;
}

function openDatabaseEditor() {
  dbEditorModal.classList.add('active');
  renderEditorQuestionsList();
  updateQuestionCounters();
}

function closeDatabaseEditor() {
  dbEditorModal.classList.remove('active');
}

function renderEditorQuestionsList() {
  if (!editorQuestionsList) return;
  editorQuestionsList.innerHTML = '';
  
  const searchFilter = (document.getElementById('modal-search-input') ? document.getElementById('modal-search-input').value : '').toLowerCase();

  window.gameQuestions.forEach(q => {
    if (searchFilter && !q.question.toLowerCase().includes(searchFilter) && !q.category.toLowerCase().includes(searchFilter)) {
      return;
    }

    const qHtml = `
      <div class="db-q-item">
        <div class="db-q-item-info">
          <span class="db-q-cat">${q.category} • ${q.answers.length} respuestas</span>
          <span class="db-q-title">${q.question}</span>
        </div>
        <button class="btn-delete-q" onclick="deleteQuestion(${q.id})">Borrar</button>
      </div>
    `;
    editorQuestionsList.insertAdjacentHTML('beforeend', qHtml);
  });
}

function saveNewQuestion() {
  const category = document.getElementById('new-q-category').value.trim();
  const qText = document.getElementById('new-q-text').value.trim();

  if (!category || !qText) {
    alert("Por favor escribe la categoría y el texto de la pregunta.");
    return;
  }

  const answers = [];
  for (let i = 1; i <= dynamicAnswersCount; i++) {
    const aEl = document.getElementById(`new-q-a${i}`);
    const pEl = document.getElementById(`new-q-p${i}`);
    const ansText = aEl ? aEl.value.trim() : '';
    const ansPts = pEl ? parseInt(pEl.value) || 0 : 0;
    
    if (ansText) {
      answers.push({ text: ansText, points: ansPts });
    }
  }

  if (answers.length < 3) {
    alert("Por favor ingresa al menos 3 respuestas con sus puntajes.");
    return;
  }

  const newId = window.gameQuestions.length > 0 
    ? Math.max(...window.gameQuestions.map(q => q.id)) + 1 
    : 1;

  const newQuestion = {
    id: newId,
    category: category,
    question: qText,
    answers: answers
  };

  window.gameQuestions.push(newQuestion);
  if (window.saveQuestions) window.saveQuestions(window.gameQuestions);

  // Limpiar formulario
  document.getElementById('new-q-category').value = '';
  document.getElementById('new-q-text').value = '';
  for (let i = 1; i <= dynamicAnswersCount; i++) {
    const aEl = document.getElementById(`new-q-a${i}`);
    const pEl = document.getElementById(`new-q-p${i}`);
    if (aEl) aEl.value = '';
    if (pEl) pEl.value = '';
  }

  renderEditorQuestionsList();
  populateCategoryFilter();
  loadQuestionDatabaseSelect();
  updateQuestionCounters();
  alert("¡Pregunta guardada con éxito en la base de datos!");
}

function deleteQuestion(id) {
  if (!confirm("¿Seguro que deseas eliminar esta pregunta?")) return;

  window.gameQuestions = window.gameQuestions.filter(q => q.id !== id);
  if (window.saveQuestions) window.saveQuestions(window.gameQuestions);

  renderEditorQuestionsList();
  populateCategoryFilter();
  loadQuestionDatabaseSelect();
  updateQuestionCounters();
}

function confirmResetDatabase() {
  if (!confirm("¿Restaurar las 40 preguntas originales de fábrica? Se sobrescribirán tus cambios.")) return;
  if (window.resetToDefaultQuestions) {
    window.gameQuestions = window.resetToDefaultQuestions();
    renderEditorQuestionsList();
    populateCategoryFilter();
    loadQuestionDatabaseSelect();
    updateQuestionCounters();
    alert("Preguntas originales restablecidas.");
  }
}

function importQuestionsJSON(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (Array.isArray(imported) && imported.length > 0 && imported[0].question) {
        window.gameQuestions = imported;
        if (window.saveQuestions) window.saveQuestions(window.gameQuestions);
        renderEditorQuestionsList();
        populateCategoryFilter();
        loadQuestionDatabaseSelect();
        updateQuestionCounters();
        alert(`¡Se importaron ${imported.length} preguntas exitosamente!`);
      } else {
        alert("El archivo JSON no tiene el formato esperado de preguntas.");
      }
    } catch (err) {
      alert("Error al leer el archivo JSON: " + err.message);
    }
  };
  reader.readAsText(file);
}


/* MODAL DE ATAJOS DE TECLADO */
function openHotkeysModal() {
  hotkeysModal.classList.add('active');
}

function closeHotkeysModal() {
  hotkeysModal.classList.remove('active');
}

// Configurar Atajos de Teclado Globales para el Show en Vivo
function setupGlobalHotkeys() {
  window.addEventListener('keydown', (e) => {
    // No activar atajos si el foco está dentro de un campo de texto o select
    const activeEl = document.activeElement;
    if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.tagName === 'SELECT')) {
      if (e.key === 'Escape') activeEl.blur();
      return;
    }

    if (e.key === 'Escape') {
      closeDatabaseEditor();
      closeHotkeysModal();
      return;
    }

    // Teclas 1 a 8: Revelar cartas
    const num = parseInt(e.key);
    if (!isNaN(num) && num >= 1 && num <= 8) {
      revealAnswerOnBoard(num - 1);
      e.preventDefault();
      return;
    }

    // Strikes: X / Shift+X / Alt+X
    if (e.key.toLowerCase() === 'x') {
      if (e.altKey) triggerStrike(3);
      else if (e.shiftKey) triggerStrike(2);
      else triggerStrike(1);
      e.preventDefault();
      return;
    }

    // Equipos: Teclas A y B
    if (e.key.toLowerCase() === 'a' && !e.ctrlKey && !e.metaKey) {
      setActiveTeam('A');
      e.preventDefault();
      return;
    }
    if (e.key.toLowerCase() === 'b' && !e.ctrlKey && !e.metaKey) {
      setActiveTeam('B');
      e.preventDefault();
      return;
    }

    // Espacio: Asignar puntos al equipo activo
    if (e.code === 'Space') {
      if (gameState.activeTeam) {
        assignAccumulatedTo(gameState.activeTeam);
        e.preventDefault();
      }
      return;
    }

    // Mute: M
    if (e.key.toLowerCase() === 'm') {
      toggleHostMute();
      e.preventDefault();
      return;
    }

    // Confeti: C
    if (e.key.toLowerCase() === 'c') {
      triggerHostConfetti();
      e.preventDefault();
      return;
    }
  });
}
