// LÓGICA DEL TABLERO DE PROYECCIÓN (BROADCAST STAGE EDITION)

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

// Overlays de Concurso
const strikesOverlay = document.getElementById('strikes-overlay');
const strikesWrapper = document.getElementById('strikes-wrapper');
const stealOverlay = document.getElementById('steal-overlay');
const stealAnnouncement = document.getElementById('steal-team-announcement');
const faceoffOverlay = document.getElementById('faceoff-overlay');
const faceoffWinnerText = document.getElementById('faceoff-winner-text');

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
let hasCelebratedFast200 = false;

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

  switch (type) {
    case 'CONNECT_HOST':
      bc.postMessage({ type: 'BOARD_CONNECTED' });
      break;

    case 'FULL_SNAPSHOT':
      applyFullSnapshot(data);
      break;

    case 'UPDATE_GAME_STATE':
      updateGameState(data);
      break;

    case 'REVEAL_ANSWER':
      revealAnswer(data.index, data.answer, data.points);
      break;

    case 'REVEAL_MISSED':
      revealMissedAnswer(data.index, data.answer, data.points);
      break;

    case 'SHOW_STRIKES':
      triggerStrikes(data.count, data.team);
      break;

    case 'UPDATE_STRIKES_LAMPS':
      updatePodiumLamps('A', data.teamAStrikes || 0);
      updatePodiumLamps('B', data.teamBStrikes || 0);
      break;

    case 'FACEOFF_BUZZ':
      triggerFaceOffBuzz(data.team, data.teamName);
      break;

    case 'STEAL_ALERT':
      triggerStealAlert(data.stealingTeam, data.stealingTeamName);
      break;

    case 'PLAY_SOUND':
      triggerSound(data.soundName);
      break;

    case 'TRIGGER_CONFETTI':
      startConfetti(2800);
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

// Animación de conteo numérico progresivo
function animateScoreCounter(element, startVal, endVal, duration = 400) {
  if (!element) return;
  if (startVal === endVal) {
    element.textContent = padScore(endVal);
    return;
  }

  const startTime = performance.now();

  function step(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(startVal + (endVal - startVal) * ease);

    element.textContent = padScore(current);

    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      element.textContent = padScore(endVal);
    }
  }

  requestAnimationFrame(step);
}

// Aplicar snapshot completo ante reconexión
function applyFullSnapshot(snapshot) {
  if (!snapshot) return;
  
  // 1. Estado base
  updateGameState(snapshot);

  // 2. Si hay pregunta activa, asegurar que las tarjetas correctas estén volteadas
  if (snapshot.currentQuestion && snapshot.currentQuestion.answers) {
    renderCards(snapshot.currentQuestion.answers);

    snapshot.currentQuestion.answers.forEach((ans, idx) => {
      if (snapshot.revealedAnswers && snapshot.revealedAnswers[idx]) {
        const card = document.getElementById(`card-${idx}`);
        if (card) {
          const textEl = card.querySelector('.card-text');
          const pointsEl = card.querySelector('.card-points');
          if (textEl) textEl.textContent = ans.text;
          if (pointsEl) pointsEl.textContent = ans.points;
          card.classList.add('revealed');
        }
      } else if (snapshot.missedAnswers && snapshot.missedAnswers[idx]) {
        const card = document.getElementById(`card-${idx}`);
        if (card) {
          const textEl = card.querySelector('.card-text');
          const pointsEl = card.querySelector('.card-points');
          if (textEl) textEl.textContent = ans.text;
          if (pointsEl) pointsEl.textContent = ans.points;
          card.classList.add('revealed', 'card-missed');
        }
      }
    });
  }

  // 3. Lámparas de Strikes
  if (snapshot.strikes) {
    updatePodiumLamps('A', snapshot.strikes.A || 0);
    updatePodiumLamps('B', snapshot.strikes.B || 0);
  }
}

// Actualizar el estado global del tablero
function updateGameState(state) {
  // 1. Nombres y Puntajes de Equipos
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
    teamAIndicator.textContent = state.phase === 'STEAL' ? "¡ROBANDO!" : "EN TURNO";
    teamBIndicator.textContent = "ESPERANDO";
  } else if (state.activeTeam === 'B') {
    teamAPanel.classList.remove('active');
    teamBPanel.classList.add('active');
    teamAIndicator.textContent = "ESPERANDO";
    teamBIndicator.textContent = state.phase === 'STEAL' ? "¡ROBANDO!" : "EN TURNO";
  } else {
    teamAPanel.classList.remove('active');
    teamBPanel.classList.remove('active');
    teamAIndicator.textContent = "ESPERANDO";
    teamBIndicator.textContent = "ESPERANDO";
  }

  // 3. Ronda y Puntos en Juego
  roundIndicator.textContent = `RONDA ${state.currentRound} (x${state.multiplier})`;
  accumulatedPoints.textContent = padScore(state.roundAccumulated);

  // 4. Pregunta Activa
  if (state.currentQuestion) {
    questionText.textContent = state.currentQuestion.question;
    
    if (JSON.stringify(activeAnswers) !== JSON.stringify(state.currentQuestion.answers)) {
      activeAnswers = state.currentQuestion.answers;
      renderCards(activeAnswers);
    }
  } else {
    questionText.textContent = "¡Bienvenidos! Esperando inicio desde la Consola del Presentador...";
    cardsContainer.innerHTML = '';
    activeAnswers = [];
  }
}

// Renderizar tarjetas estilo persiana split-flap
function renderCards(answers) {
  cardsContainer.innerHTML = '';
  const count = answers ? answers.length : 0;
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

// Revelar una respuesta por acierto en juego
function revealAnswer(index, answerText, points) {
  const card = document.getElementById(`card-${index}`);
  if (!card) return;

  const textEl = card.querySelector('.card-text');
  const pointsEl = card.querySelector('.card-points');

  if (textEl) textEl.textContent = answerText;
  if (pointsEl) pointsEl.textContent = points;

  if (!card.classList.contains('revealed')) {
    if (window.sounds) {
      window.sounds.playMechanicalFlap();
      setTimeout(() => {
        window.sounds.playCorrect();
      }, 160);
    }
    card.classList.remove('card-missed');
    card.classList.add('revealed');
  }
}

// Revelar respuesta que nadie adivinó (curiosidad, sin puntos)
function revealMissedAnswer(index, answerText, points) {
  const card = document.getElementById(`card-${index}`);
  if (!card) return;

  const textEl = card.querySelector('.card-text');
  const pointsEl = card.querySelector('.card-points');

  if (textEl) textEl.textContent = answerText;
  if (pointsEl) pointsEl.textContent = points;

  if (!card.classList.contains('revealed')) {
    if (window.sounds) {
      window.sounds.playMechanicalFlap();
    }
    card.classList.add('revealed', 'card-missed');
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
    xSpan.style.transitionDelay = `${i * 80}ms`;
    strikesWrapper.appendChild(xSpan);
  }

  // Actualizar lámpara física del podio
  if (team === 'A' || team === 'B') {
    updatePodiumLamps(team, count);
  }

  strikesOverlay.classList.add('active');

  if (window.sounds) {
    window.sounds.playWrong();
  }

  setTimeout(() => {
    strikesOverlay.classList.remove('active');
  }, 1250);
}

// Actualizar las 3 lámparas del podio
function updatePodiumLamps(team, count) {
  const prefix = team === 'A' ? 'team-a' : 'team-b';
  for (let i = 1; i <= 3; i++) {
    const lamp = document.getElementById(`${prefix}-x${i}`);
    if (lamp) {
      lamp.classList.toggle('active', i <= count);
    }
  }
}

function clearPodiumStrikes() {
  ['A', 'B'].forEach(t => updatePodiumLamps(t, 0));
}

// Alerta de Duelo de Capitanes (Face-Off)
function triggerFaceOffBuzz(team, teamName) {
  if (!faceoffOverlay) return;

  faceoffWinnerText.textContent = team 
    ? `¡${teamName || (team === 'A' ? 'EQUIPO A' : 'EQUIPO B')} PULSÓ PRIMERO!` 
    : '¡ATENTOS AL PULSADOR!';

  faceoffOverlay.classList.add('active');
  if (window.sounds) window.sounds.playFaceOffBuzzer();

  setTimeout(() => {
    faceoffOverlay.classList.remove('active');
  }, 1800);
}

// Alerta de Oportunidad de Robo
function triggerStealAlert(stealingTeam, teamName) {
  if (!stealOverlay) return;

  stealAnnouncement.textContent = `¡${teamName || (stealingTeam === 'A' ? 'EQUIPO A' : 'EQUIPO B')} TIENE UNA OPORTUNIDAD PARA ROBAR!`;
  stealOverlay.classList.add('active');

  if (window.sounds) window.sounds.playStealAlert();

  setTimeout(() => {
    stealOverlay.classList.remove('active');
  }, 2200);
}

// Reproducir efectos de sonido directos
function triggerSound(soundName) {
  if (!window.sounds) return;
  
  if (soundName === 'correct') window.sounds.playCorrect();
  else if (soundName === 'wrong') window.sounds.playWrong();
  else if (soundName === 'win') window.sounds.playWin();
  else if (soundName === 'tick') window.sounds.playTick();
  else if (soundName === 'whoosh') window.sounds.playWhoosh();
  else if (soundName === 'mechanical_flap') window.sounds.playMechanicalFlap();
  else if (soundName === 'faceoff_buzzer') window.sounds.playFaceOffBuzzer();
  else if (soundName === 'steal_alert') window.sounds.playStealAlert();
  else if (soundName === 'repeat_answer') window.sounds.playRepeatAnswer();
}

/* DINERO RÁPIDO - LÓGICA DEL PROYECTOR */

function toggleFastMoney(show) {
  if (show) {
    fastMoneyOverlay.classList.add('active');
    hasCelebratedFast200 = false;
    if (window.sounds) window.sounds.playWin();
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

  fastGrandTotalEl.textContent = grandTotal;

  // Actualizar barra de progreso hacia la meta de 200 puntos
  if (fastProgressBar) {
    const pct = Math.min(100, Math.max(0, (grandTotal / 200) * 100));
    fastProgressBar.style.width = `${pct}%`;
  }

  // Celebración automática si se alcanzan los 200 puntos
  if (grandTotal >= 200 && !hasCelebratedFast200) {
    hasCelebratedFast200 = true;
    startConfetti(4500);
    if (window.sounds) window.sounds.playWin();
  }
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
  
  if (time > 0) {
    if (window.sounds) window.sounds.playTick();
  } else {
    if (window.sounds) window.sounds.playWrong();
  }
}

/* SISTEMA DE CONFETI EN CANVAS */
function startConfetti(duration = 3000) {
  if (!confettiCanvas || !confettiCtx) return;

  confettiParticles = [];
  const colors = ['#f59e0b', '#fbbf24', '#3b82f6', '#ef4444', '#10b981', '#ffffff'];
  
  for (let i = 0; i < 110; i++) {
    confettiParticles.push({
      x: Math.random() * confettiCanvas.width,
      y: Math.random() * confettiCanvas.height - confettiCanvas.height,
      r: Math.random() * 8 + 4,
      d: Math.random() * 110,
      color: colors[Math.floor(Math.random() * colors.length)],
      tilt: Math.floor(Math.random() * 10) - 10,
      tiltAngleIncremental: (Math.random() * 0.07) + 0.05,
      tiltAngle: 0
    });
  }

  const startTime = Date.now();

  function drawConfetti() {
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

    confettiParticles.forEach(p => {
      p.tiltAngle += p.tiltAngleIncremental;
      p.y += (Math.cos(p.d) + 3 + p.r / 2) / 1.5;
      p.x += Math.sin(p.d);
      p.tilt = Math.sin(p.tiltAngle) * 12;

      confettiCtx.beginPath();
      confettiCtx.lineWidth = p.r / 1.5;
      confettiCtx.strokeStyle = p.color;
      confettiCtx.moveTo(p.x + p.tilt + p.r / 3, p.y);
      confettiCtx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 4);
      confettiCtx.stroke();
    });

    if (Date.now() - startTime < duration) {
      confettiAnimationId = requestAnimationFrame(drawConfetti);
    } else {
      confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
      cancelAnimationFrame(confettiAnimationId);
    }
  }

  drawConfetti();
}

// Desbloquear audio del navegador
function unlockAudio() {
  if (window.sounds) {
    window.sounds.init();
    if (audioBanner) audioBanner.classList.add('hidden');
  }
}

document.addEventListener('click', unlockAudio, { once: true });
document.addEventListener('keydown', unlockAudio, { once: true });

function toggleFullScreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(err => console.log(err));
  } else {
    if (document.exitFullscreen) document.exitFullscreen();
  }
}

// Auto-conectar y pedir snapshot completo al abrir
setTimeout(() => {
  bc.postMessage({ type: 'BOARD_CONNECTED' });
}, 300);
