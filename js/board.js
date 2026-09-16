// LÓGICA DEL TABLERO DE PROYECCIÓN (PÚBLICO) - EDICIÓN TV SHOW

// Inicializar el canal de comunicación local
const bc = new BroadcastChannel('cristianos_dijeron_channel');

// Referencias a elementos del DOM
const roundIndicator = document.getElementById('round-indicator');
const accumulatedPoints = document.getElementById('accumulated-points');
const questionText = document.getElementById('question-text');
const cardsContainer = document.getElementById('board-cards-container');
const audioBanner = document.getElementById('audio-unlock-banner');

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
const fastProgressBar = document.getElementById('fast-progress-bar');

// Estado interno local para animaciones suaves
let activeAnswers = [];
let currentScoreA = 0;
let currentScoreB = 0;
let currentAccumulated = 0;
let currentFastTotal = 0;
let activeTeamStrikes = { A: 0, B: 0 };

// Canvas de Confeti
const confettiCanvas = document.getElementById('confetti-canvas');
let confettiCtx = null;
let confettiParticles = [];
let confettiAnimationId = null;

if (confettiCanvas) {
  confettiCtx = confettiCanvas.getContext('2d');
  resizeConfettiCanvas();
  window.addEventListener('resize', resizeConfettiCanvas);
}

function resizeConfettiCanvas() {
  if (!confettiCanvas) return;
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
}

// Escuchar los mensajes provenientes de la Consola del Presentador (Host)
bc.onmessage = function (event) {
  const { type, data } = event.data;
  console.log("Mensaje recibido del Host:", type, data);

  switch (type) {
    case 'CONNECT_HOST':
      bc.postMessage({ type: 'BOARD_CONNECTED' });
      break;

    case 'UPDATE_GAME_STATE':
      updateGameState(data);
      break;

    case 'REVEAL_ANSWER':
      revealAnswer(data.index, data.answer, data.points);
      break;

    case 'SHOW_STRIKES':
      triggerStrikes(data.count, data.team);
      break;

    case 'PLAY_SOUND':
      triggerSound(data.soundName);
      break;

    case 'TRIGGER_CONFETTI':
      startConfetti(2500);
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

// Animación de conteo numérico progresivo (Roll-up animado)
function animateScoreCounter(element, startVal, endVal, duration = 450) {
  if (!element) return;
  if (startVal === endVal) {
    element.textContent = padScore(endVal);
    return;
  }

  const startTime = performance.now();
  element.classList.add('bump');

  function step(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // Curva suave outQuart
    const ease = 1 - Math.pow(1 - progress, 4);
    const current = Math.round(startVal + (endVal - startVal) * ease);

    element.textContent = padScore(current);

    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      element.textContent = padScore(endVal);
      setTimeout(() => element.classList.remove('bump'), 150);
    }
  }

  requestAnimationFrame(step);
}

// Actualizar el estado global del tablero
function updateGameState(state) {
  // 1. Nombres y Puntajes de Equipos con Conteo Animado
  teamANameEl.textContent = state.teamA.name || "GRUPO A";
  teamBNameEl.textContent = state.teamB.name || "GRUPO B";

  const targetScoreA = parseInt(state.teamA.score) || 0;
  const targetScoreB = parseInt(state.teamB.score) || 0;

  if (targetScoreA !== currentScoreA) {
    animateScoreCounter(teamAScoreEl, currentScoreA, targetScoreA);
    currentScoreA = targetScoreA;
  }

  if (targetScoreB !== currentScoreB) {
    animateScoreCounter(teamBScoreEl, currentScoreB, targetScoreB);
    currentScoreB = targetScoreB;
  }

  // 2. Panel Activo / Indicador de Turno
  if (state.activeTeam === 'A') {
    teamAPanel.classList.add('active');
    teamBPanel.classList.remove('active');
    teamAIndicator.textContent = "EN TURNO";
    teamBIndicator.textContent = "ESPERANDO";
  } else if (state.activeTeam === 'B') {
    teamAPanel.classList.remove('active');
    teamBPanel.classList.add('active');
    teamAIndicator.textContent = "ESPERANDO";
    teamBIndicator.textContent = "EN TURNO";
  } else {
    teamAPanel.classList.remove('active');
    teamBPanel.classList.remove('active');
    teamAIndicator.textContent = "LISTOS";
    teamBIndicator.textContent = "LISTOS";
  }

  // 3. Ronda y Puntos en Juego (Conteo suave)
  roundIndicator.textContent = `RONDA ${state.currentRound} (x${state.multiplier})`;
  const targetAccumulated = parseInt(state.roundAccumulated) || 0;

  if (targetAccumulated !== currentAccumulated) {
    animateScoreCounter(accumulatedPoints, currentAccumulated, targetAccumulated);
    currentAccumulated = targetAccumulated;
  }

  // 4. Pregunta Activa
  if (state.currentQuestion) {
    questionText.textContent = state.currentQuestion.question;

    // Si cambió la pregunta, renderizar las tarjetas correspondientes
    if (JSON.stringify(activeAnswers) !== JSON.stringify(state.currentQuestion.answers)) {
      activeAnswers = state.currentQuestion.answers;
      renderCards(activeAnswers);
    }
  } else {
    questionText.textContent = "¡Bienvenidos! Esperando la primera pregunta del presentador...";
    cardsContainer.innerHTML = '';
    activeAnswers = [];
  }
}

// Renderizar tarjetas estilo persiana (admite de 3 a 8 respuestas con simetría)
function renderCards(answers) {
  cardsContainer.innerHTML = '';
  const count = answers ? answers.length : 0;
  // Total de casillas (mínimo 6 para un tablero balanceado, hasta 8)
  const totalSlots = Math.min(8, Math.max(6, count));

  for (let i = 0; i < totalSlots; i++) {
    const hasAnswer = i < count;
    const cardHtml = `
      <div class="card-container ${hasAnswer ? '' : 'card-empty'}" id="card-${i}">
        <div class="card-inner">
          <div class="card-front">
            <span class="card-index">${i + 1}</span>
          </div>
          <div class="card-back">
            <span class="card-text">${hasAnswer ? '---' : ''}</span>
            <span class="card-points">${hasAnswer ? '0' : ''}</span>
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

  const textEl = card.querySelector('.card-text');
  const pointsEl = card.querySelector('.card-points');

  if (textEl) textEl.textContent = answerText;
  if (pointsEl) pointsEl.textContent = points;

  // Si no estaba revelada, sonido whoosh + ding armónico y volteo 3D
  if (!card.classList.contains('revealed')) {
    if (window.sounds) {
      window.sounds.playWhoosh();
      setTimeout(() => {
        window.sounds.playCorrect();
      }, 180);
    }
    card.classList.add('revealed');
  }
}

// Disparar animación y sonido de los Strikes
function triggerStrikes(count, team = null) {
  if (count === 0) {
    clearPodiumStrikes();
    return;
  }
  if (!count || count < 1 || count > 3) return;

  strikesWrapper.innerHTML = '';

  for (let i = 0; i < count; i++) {
    const xSpan = document.createElement('span');
    xSpan.className = 'strike-x';
    xSpan.textContent = 'X';
    xSpan.style.transitionDelay = `${i * 90}ms`;
    strikesWrapper.appendChild(xSpan);
  }

  // Activar indicadores de strike en el podio si hay equipo
  if (team === 'A' || team === 'B') {
    updatePodiumStrikes(team, count);
  }

  strikesOverlay.classList.add('active');

  if (window.sounds) {
    window.sounds.playWrong();
  }

  setTimeout(() => {
    strikesOverlay.classList.remove('active');
  }, 1300);
}

function updatePodiumStrikes(team, count) {
  const prefix = team === 'A' ? 'team-a' : 'team-b';
  for (let i = 1; i <= 3; i++) {
    const el = document.getElementById(`${prefix}-x${i}`);
    if (el) {
      el.classList.toggle('active', i <= count);
    }
  }
}

function clearPodiumStrikes() {
  ['team-a', 'team-b'].forEach(prefix => {
    for (let i = 1; i <= 3; i++) {
      const el = document.getElementById(`${prefix}-x${i}`);
      if (el) el.classList.remove('active');
    }
  });
}

// Reproducir un sonido de manera explícita
function triggerSound(soundName) {
  if (!window.sounds) return;
  if (soundName === 'correct') window.sounds.playCorrect();
  else if (soundName === 'wrong') window.sounds.playWrong();
  else if (soundName === 'win') {
    window.sounds.playWin();
    startConfetti(3500);
  } else if (soundName === 'tick') window.sounds.playTick();
}

/* DINERO RÁPIDO (FAST MONEY) */

function toggleFastMoney(show) {
  if (show) {
    fastMoneyOverlay.classList.add('active');
    if (window.sounds) window.sounds.playWin();
    startConfetti(2000);
  } else {
    fastMoneyOverlay.classList.remove('active');
  }
}

function updateFastMoneyState(data) {
  const { player1, player2, grandTotal } = data;

  renderFastPlayerRows(p1RowsContainer, player1.answers);
  p1TotalEl.textContent = player1.total;

  renderFastPlayerRows(p2RowsContainer, player2.answers);
  p2TotalEl.textContent = player2.total;

  // Actualizar Gran Total y Barra de Progreso hacia 200 Puntos
  const targetTotal = parseInt(grandTotal) || 0;
  fastGrandTotalEl.textContent = targetTotal;

  const percentage = Math.min(100, Math.round((targetTotal / 200) * 100));
  if (fastProgressBar) {
    fastProgressBar.style.width = `${percentage}%`;
  }

  // Si alcanzan la meta de 200 puntos, ¡gran fanfarria y confeti!
  if (targetTotal >= 200 && currentFastTotal < 200) {
    if (window.sounds) window.sounds.playWin();
    startConfetti(6000);
  }
  currentFastTotal = targetTotal;
}

function renderFastPlayerRows(container, answers) {
  container.innerHTML = '';
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

function updateFastMoneyTimer(time) {
  fastMoneyTimer.textContent = time;

  if (time <= 5 && time > 0) {
    fastMoneyTimer.classList.add('urgent');
    if (window.sounds) window.sounds.playTick(true);
  } else if (time > 0) {
    fastMoneyTimer.classList.remove('urgent');
    if (window.sounds) window.sounds.playTick(false);
  } else {
    fastMoneyTimer.classList.remove('urgent');
    fastMoneyTimer.textContent = "0";
    if (window.sounds) window.sounds.playWrong();
  }
}

/* SISTEMA DE CONFETI EN CANVAS (Ultra Ligero, 60 FPS) */
function startConfetti(duration = 3000) {
  if (!confettiCtx) return;

  const colors = ['#00f0ff', '#ffd000', '#ff007f', '#25f458', '#ffffff', '#ff6600'];
  const particleCount = 120;

  confettiParticles = [];
  for (let i = 0; i < particleCount; i++) {
    confettiParticles.push({
      x: Math.random() * confettiCanvas.width,
      y: -20 - Math.random() * 80,
      w: 8 + Math.random() * 8,
      h: 5 + Math.random() * 8,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: -3 + Math.random() * 6,
      vy: 3 + Math.random() * 6,
      rotation: Math.random() * 360,
      vRot: -6 + Math.random() * 12,
      opacity: 1
    });
  }

  const startTime = performance.now();
  cancelAnimationFrame(confettiAnimationId);

  function renderConfetti(now) {
    const elapsed = now - startTime;
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

    let activeCount = 0;
    confettiParticles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.vRot;

      if (elapsed > duration - 800) {
        p.opacity = Math.max(0, 1 - (elapsed - (duration - 800)) / 800);
      }

      if (p.y < confettiCanvas.height + 30 && p.opacity > 0) {
        activeCount++;
        confettiCtx.save();
        confettiCtx.globalAlpha = p.opacity;
        confettiCtx.translate(p.x, p.y);
        confettiCtx.rotate((p.rotation * Math.PI) / 180);
        confettiCtx.fillStyle = p.color;
        confettiCtx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        confettiCtx.restore();
      }
    });

    if (activeCount > 0 && elapsed < duration) {
      confettiAnimationId = requestAnimationFrame(renderConfetti);
    } else {
      confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    }
  }

  confettiAnimationId = requestAnimationFrame(renderConfetti);
}

/* UTILIDADES Y ACTIVACIÓN */
function unlockAudio() {
  if (window.sounds) {
    window.sounds.init();
    window.sounds.playCorrect();
  }
  if (audioBanner) {
    audioBanner.classList.add('hidden');
  }
}

document.addEventListener('click', unlockAudio, { once: true });

function toggleFullScreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(err => {
      console.log(`Error al entrar a pantalla completa: ${err.message}`);
    });
  } else {
    document.exitFullscreen();
  }
}

// Auto-conectar con el host al abrir la pestaña
setTimeout(() => {
  bc.postMessage({ type: 'BOARD_CONNECTED' });
}, 400);
