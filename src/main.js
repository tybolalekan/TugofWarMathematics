import './style.css';
import { generateProblem, OPERATIONS } from './math.js';
import { state, resetState } from './state.js';

/**
 * DOM Element references.
 * These are used to update the UI and listen for user interactions.
 */
const dashboard = document.getElementById('dashboard');
const gameScreen = document.getElementById('game-screen');
const resultScreen = document.getElementById('result-screen');
const timerDisplay = document.getElementById('timer-display');
const ropeMarker = document.getElementById('rope-marker');
const resultTitle = document.getElementById('result-title');
const resultMessage = document.getElementById('result-message');
const playAgainBtn = document.getElementById('play-again-btn');
const levelSelect = document.getElementById('level-select');
const backToMenuBtn = document.getElementById('back-to-menu');
const opponentLabel = document.getElementById('opponent-label');
const p1Char = document.getElementById('p1-character');
const opponentChar = document.getElementById('opponent-character');

/** Mode Selection Buttons */
const singlePlayerModeBtn = document.getElementById('single-player-mode');
const twoPlayerModeBtn = document.getElementById('two-player-mode');
const modeDescription = document.getElementById('mode-description');

/** Question Area Containers */
const singlePlayerQuestion = document.getElementById('single-player-question');
const twoPlayerQuestions = document.getElementById('two-player-questions');

/** Global timer variables for clearing intervals later */
let gameTimer = null;
let opponentTimer = null;

/** 
 * Initialization & Event Listeners
 * Setup core application behavior on load.
 */
singlePlayerModeBtn.addEventListener('click', () => setMode('single'));
twoPlayerModeBtn.addEventListener('click', () => setMode('two-player'));

// Start game when an operation button is clicked
document.querySelectorAll('.op-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const op = btn.dataset.operation;
    const level = parseInt(levelSelect.value);
    startGame(op, level);
  });
});

playAgainBtn.addEventListener('click', showDashboard);
backToMenuBtn.addEventListener('click', () => {
  endGame();
  showDashboard();
});

// Setup input listeners for Single Player question area
const spInput = singlePlayerQuestion.querySelector('.answer-input');
const spSubmit = singlePlayerQuestion.querySelector('.submit-btn');
spSubmit.addEventListener('click', () => handleSubmission(1));
spInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') handleSubmission(1);
});

// Setup input listeners for Two Player question area (Left and Right boxes)
const tpInputs = twoPlayerQuestions.querySelectorAll('.answer-input');
const tpSubmits = twoPlayerQuestions.querySelectorAll('.submit-btn');

tpSubmits.forEach(btn => {
  btn.addEventListener('click', () => handleSubmission(parseInt(btn.dataset.player)));
});
tpInputs.forEach(input => {
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSubmission(parseInt(input.dataset.player));
  });
});

/**
 * Switches the game mode between 'single' and 'two-player'.
 * Updates button styles, descriptions, and character graphics.
 */
function setMode(mode) {
  state.gameMode = mode;
  if (mode === 'single') {
    singlePlayerModeBtn.classList.add('active');
    twoPlayerModeBtn.classList.remove('active');
    modeDescription.textContent = "Face off against the computer!";
    opponentLabel.textContent = "COMPUTER";
    opponentChar.classList.add('robot'); // Show Robot character
    opponentChar.classList.remove('kid2');
  } else {
    singlePlayerModeBtn.classList.remove('active');
    twoPlayerModeBtn.classList.add('active');
    modeDescription.textContent = "Compete with a friend on the same device!";
    opponentLabel.textContent = "PLAYER 2";
    opponentChar.classList.add('kid2'); // Show second Kid character
    opponentChar.classList.remove('robot');
  }
}

/** Returns the user to the main menu screen and resets state. */
function showDashboard() {
  resultScreen.classList.add('hidden');
  dashboard.classList.remove('hidden');
  gameScreen.classList.add('hidden');
  resetState();
}

/**
 * Main game initialization function.
 * Sets the operation, level, and starts the game timers.
 */
function startGame(operation, level) {
  resetState();
  state.operation = operation;
  state.level = level;
  state.gameActive = true;

  dashboard.classList.add('hidden');
  gameScreen.classList.remove('hidden');

  if (state.gameMode === 'single') {
    // SINGLE PLAYER SETUP
    singlePlayerQuestion.classList.remove('hidden');
    twoPlayerQuestions.classList.add('hidden');

    // Adjust pull speed and strength based on level
    state.opponentPullSpeed = 3000 / level;
    state.pullStrength = 8 / level;

    nextQuestion(1); // Generate first question for Player 1
    startOpponentPulls(); // Start the computer's pulling interval
  } else {
    // TWO PLAYER SETUP
    singlePlayerQuestion.classList.add('hidden');
    twoPlayerQuestions.classList.remove('hidden');

    state.pullStrength = 5; // Fixed strength for fair PvP

    nextQuestion(1); // Generate first question for Player 1
    nextQuestion(2); // Generate first question for Player 2
  }

  updateUI();

  // Start the match timer (1s interval)
  let startTime = Date.now();
  gameTimer = setInterval(() => {
    state.timer = Math.floor((Date.now() - startTime) / 1000);
    timerDisplay.textContent = `Time: ${state.timer}s`;
  }, 1000);
}

/**
 * Generates and displays the next math problem for a specific player.
 * Clears the input field and restores focus.
 * 
 * @param {number} playerNum - The player index (1 or 2).
 */
function nextQuestion(playerNum) {
  const problem = generateProblem(state.operation, state.level);

  if (state.gameMode === 'single' || playerNum === 1) {
    state.player1Problem = problem;
    const container = state.gameMode === 'single' ? singlePlayerQuestion : twoPlayerQuestions.querySelector('.left-player');
    container.querySelector('.question-text').textContent = problem.question;
    const input = container.querySelector('.answer-input');
    input.value = '';
    input.focus(); // Keep focus on the active player
  } else {
    state.player2Problem = problem;
    const container = twoPlayerQuestions.querySelector('.right-player');
    container.querySelector('.question-text').textContent = problem.question;
    const input = container.querySelector('.answer-input');
    input.value = '';
    input.focus();
  }
}

/**
 * Handles answer submission for a player.
 * Calculates result, moves rope, triggers feedback, and moves to next question.
 * 
 * @param {number} playerNum - The player who submitted the answer.
 */
function handleSubmission(playerNum) {
  if (!state.gameActive) return;

  let input, problem;
  if (state.gameMode === 'single') {
    input = singlePlayerQuestion.querySelector('.answer-input');
    problem = state.player1Problem;
  } else {
    const container = playerNum === 1 ? twoPlayerQuestions.querySelector('.left-player') : twoPlayerQuestions.querySelector('.right-player');
    input = container.querySelector('.answer-input');
    problem = playerNum === 1 ? state.player1Problem : state.player2Problem;
  }

  const userAnswer = parseInt(input.value);
  if (isNaN(userAnswer)) return;

  if (userAnswer === problem.answer) {
    // Player correctly answers -> Move rope TOWARD them
    pullRope(playerNum === 1 ? -state.pullStrength : state.pullStrength);
    handleFeedback(playerNum, true);
  } else {
    // Incorrect answer -> Move rope AWAY from them (Penalty)
    pullRope(playerNum === 1 ? state.pullStrength : -state.pullStrength);
    handleFeedback(playerNum, false);
  }

  nextQuestion(playerNum);
}

/**
 * Moves the rope marker and checks for victory/defeat.
 * @param {number} amount - The amount to move (negative for left, positive for right).
 */
function pullRope(amount) {
  state.ropePosition += amount;
  // Constraint: Keep rope marker within sensible bounds (5% to 95%)
  state.ropePosition = Math.max(5, Math.min(95, state.ropePosition));

  updateUI();
  checkWinLoss();
}

/**
 * Starts the interval for the computer opponent's constant "pulling".
 * Speed and strength are determined by the difficulty level.
 */
function startOpponentPulls() {
  opponentTimer = setInterval(() => {
    if (state.gameActive && state.gameMode === 'single') {
      pullRope(2 * state.level);
    }
  }, state.opponentPullSpeed);
}

/** Updates the visual position of the rope marker on the screen. */
function updateUI() {
  ropeMarker.style.left = `${state.ropePosition}%`;
}

/** Checks the rope position against winning/losing thresholds. */
function checkWinLoss() {
  if (state.ropePosition <= 10) {
    winGame(1); // Player 1 (you) pulled to the far left
  } else if (state.ropePosition >= 90) {
    if (state.gameMode === 'single') {
      loseGame(); // Computer pulled you to the far right
    } else {
      winGame(2); // Player 2 won
    }
  }
}

/** Triggers the victory screen and stops game timers. */
function winGame(playerNum) {
  endGame();
  resultTitle.textContent = state.gameMode === 'single' ? "YOU WIN! 🎉" : `PLAYER ${playerNum} WINS! 🏆`;
  resultTitle.className = "win";
  resultMessage.textContent = state.gameMode === 'single'
    ? `Great job! You defeated the computer in ${state.timer} seconds.`
    : `Victory for Player ${playerNum}! Match duration: ${state.timer} seconds.`;
  resultScreen.classList.remove('hidden');
  gameScreen.classList.add('hidden');
}

/** Triggers the defeat screen (only in single player). */
function loseGame() {
  endGame();
  resultTitle.textContent = "DEFEAT... 😔";
  resultTitle.className = "loss";
  resultMessage.textContent = "The computer was too fast! Keep practicing your math skills.";
  resultScreen.classList.remove('hidden');
  gameScreen.classList.add('hidden');
}

/** Stops all game active flags and clears background timers. */
function endGame() {
  state.gameActive = false;
  clearInterval(gameTimer);
  clearInterval(opponentTimer);
}

/**
 * Triggers a visual "flash" or "shake" on the character sprite.
 * Providing immediate visual feedback for correct or wrong answers.
 */
function handleFeedback(playerNum, isCorrect) {
  const char = playerNum === 1 ? p1Char : opponentChar;
  const feedbackClass = isCorrect ? 'correct-flash' : 'wrong-flash';

  char.classList.add(feedbackClass);
  setTimeout(() => {
    char.classList.remove(feedbackClass);
  }, 500);
}

/** 
 * Register the Service Worker for PWA features.
 * This allows the app to work offline and be installable.
 */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('SW registered!', reg))
      .catch(err => console.log('SW registration failed: ', err));
  });
}
