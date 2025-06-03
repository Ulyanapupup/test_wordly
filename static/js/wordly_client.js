const socket = io();

// UI Elements
const lobby = document.getElementById('lobby');
const game = document.getElementById('game');
const createRoomBtn = document.getElementById('createRoom');
const joinRoomBtn = document.getElementById('joinRoom');
const roomIdInput = document.getElementById('roomIdInput');
const submitWordBtn = document.getElementById('submitWord');
const secretWordInput = document.getElementById('secretWord');
const guessSection = document.getElementById('guessSection');
const guessInput = document.getElementById('guessInput');
const submitGuessBtn = document.getElementById('submitGuess');
const gameStatus = document.getElementById('gameStatus');
const evaluationSection = document.getElementById('evaluationSection');
const opponentGuess = document.getElementById('opponentGuess');
const submitEvaluationBtn = document.getElementById('submitEvaluation');
const guessHistory = document.getElementById('guessHistory');

const myWordDisplay = document.getElementById('myWord');
const opponentWordDisplay = document.getElementById('opponentWord');
const gameInfo = document.getElementById('gameInfo');

const leaveLobbyBtn = document.getElementById('leaveLobby');
const leaveGameBtn = document.getElementById('leaveGame');

let roomId = null;
let playerId = null;
let currentEvaluation = [];
let opponentLetters = [];

createRoomBtn.addEventListener('click', () => {
  socket.emit('create_wordly_room');
});

joinRoomBtn.addEventListener('click', () => {
  const id = roomIdInput.value.trim();
  if (id) {
    socket.emit('join_wordly_room', { roomId: id });
  }
});

submitWordBtn.addEventListener('click', () => {
  const word = secretWordInput.value.trim();
  if (word.length === 5) {
    socket.emit('submit_wordly_word', { 
      roomId, 
      word 
    });
    document.getElementById('wordSubmission').style.display = 'none';
    myWordDisplay.textContent = word;
    gameInfo.classList.remove('hidden');
    gameStatus.textContent = 'Дождитесь соперника...';
  }
});

submitGuessBtn.addEventListener('click', () => {
  const guess = guessInput.value.trim();
  if (guess.length === 5) {
    socket.emit('make_wordly_guess', { 
      roomId, 
      guess 
    });
    addGuessToHistory(guess, 'pending');
    guessInput.value = '';

    // Блокируем ввод до получения оценки
    guessInput.disabled = true;
    submitGuessBtn.disabled = true;
  }
});

// Сервер присылает результат оценки слова
socket.on('wordly_guess_evaluated', (data) => {
  addGuessToHistory(data.guess, data.evaluation);

  // Разблокируем ввод
  guessInput.disabled = false;
  submitGuessBtn.disabled = false;
});

leaveLobbyBtn.addEventListener('click', () => {
  window.location.href = '/mode_selection';
});

leaveGameBtn.addEventListener('click', () => {
  if (roomId) {
    socket.emit('leave_wordly_game', { roomId });
  }
  window.location.href = '/mode_selection';
});

submitEvaluationBtn.addEventListener('click', () => {
  socket.emit('submit_wordly_evaluation', { 
    roomId, 
    evaluation: currentEvaluation 
  });
  evaluationSection.classList.add('hidden');
  guessSection.classList.remove('hidden');
  gameStatus.textContent = 'Дождитесь соперника...';
});

function createLetterElement(letter, index) {
  const letterElement = document.createElement('div');
  letterElement.className = 'letter';
  letterElement.textContent = letter;
  letterElement.dataset.index = index;
  letterElement.dataset.state = 'none';
  
  letterElement.addEventListener('click', () => {
    const states = ['none', 'green', 'yellow'];
    const currentState = letterElement.dataset.state;
    const currentIndex = states.indexOf(currentState);
    const nextState = states[(currentIndex + 1) % states.length];
    
    letterElement.dataset.state = nextState;
    letterElement.className = 'letter ' + nextState;
    
    currentEvaluation[index] = nextState === 'none' ? null : nextState;
  });
  
  return letterElement;
}

function setupEvaluation(guess) {
  opponentGuess.innerHTML = '';
  currentEvaluation = new Array(5).fill(null);
  opponentLetters = guess.split('');
  
  opponentLetters.forEach((letter, index) => {
    opponentGuess.appendChild(createLetterElement(letter, index));
  });
}

function addGuessToHistory(guess, result) {
  // Не отображать строку, если результат еще не готов
  if (result === 'pending') return;

  const guessElement = document.createElement('div');
  guessElement.className = 'guess-row';

  for (let i = 0; i < 5; i++) {
    const letterBox = document.createElement('div');
    letterBox.className = 'letter';
    letterBox.textContent = guess[i];

    const state = result[i]; // 'green', 'yellow', 'gray'
    letterBox.classList.add(state);

    guessElement.appendChild(letterBox);
  }

  guessHistory.appendChild(guessElement);
}

// Socket events
socket.on('wordly_room_created', (data) => {
  roomId = data.roomId;
  playerId = socket.id;
  lobby.classList.add('hidden');
  game.classList.remove('hidden');
  gameStatus.textContent = `Комната создана. Поделитесь этим кодом с другом: ${roomId}`;
  leaveLobbyBtn.classList.remove('hidden');
  document.getElementById('roomCode').textContent = roomId;
});

socket.on('wordly_room_joined', (data) => {
  roomId = data.roomId;
  playerId = socket.id;
  lobby.classList.add('hidden');
  game.classList.remove('hidden');
  gameStatus.textContent = 'Вы присоединились к комнате. Введите ваше слово';
  leaveLobbyBtn.classList.remove('hidden');
  document.getElementById('roomCode').textContent = roomId;
});

socket.on('wordly_start_game', (data) => {
  const resultsSection = document.getElementById('resultsSection');
  resultsSection.classList.add('hidden');
  guessHistory.parentElement.classList.remove('hidden');
  gameInfo.classList.remove('hidden');
  guessSection.classList.remove('hidden');
  evaluationSection.classList.add('hidden');
  
  if (data.firstPlayer === playerId) {
    gameStatus.textContent = 'Игра началась! Ваш ход';
    guessSection.classList.remove('hidden');
  } else {
    gameStatus.textContent = 'Игра началась! Ждём ход соперника...';
  }
  leaveLobbyBtn.classList.add('hidden');
  leaveGameBtn.classList.remove('hidden');
});

socket.on('wordly_force_leave', () => {
  window.location.href = '/mode_selection';
});

socket.on('wordly_opponent_guess', (data) => {
  gameStatus.textContent = 'Evaluate opponent\'s guess.';
  guessSection.classList.add('hidden');
  evaluationSection.classList.remove('hidden');
  setupEvaluation(data.guess);
});

socket.on('wordly_game_over', (data) => {
  guessHistory.parentElement.classList.add('hidden');  // скрыть историю догадок
  evaluationSection.classList.add('hidden');
  gameInfo.classList.add('hidden');

  // Показать итоги
  const resultsSection = document.getElementById('resultsSection');
  resultsSection.classList.remove('hidden');

  const myWord = data.words[playerId];
  const opponentId = Object.keys(data.words).find(id => id !== playerId);
  const opponentWord = data.words[opponentId];

  document.getElementById('resultMyWord').textContent = myWord;
  document.getElementById('resultOpponentWord').textContent = opponentWord;

  const resultStatus = document.getElementById('resultStatus');
  if (data.winner === playerId) {
    resultStatus.textContent = 'Поздравляем! Вы выиграли!';
    resultStatus.style.color = 'green';
  } else {
    resultStatus.textContent = 'К сожалению, вы проиграли.';
    resultStatus.style.color = 'red';
  }

  gameStatus.textContent = '';
});

socket.on('wordly_player_disconnected', () => {
  gameStatus.textContent = 'Соперник отключился. Игра окончена';
  guessSection.classList.add('hidden');
  evaluationSection.classList.add('hidden');
});

socket.on('wordly_guess_made', (data) => {
  const guessElement = document.createElement('div');
  guessElement.className = 'guess-row';
  
  data.guess.split('').forEach((letter, index) => {
    const letterElement = document.createElement('div');
    letterElement.className = `letter ${data.result[index] || ''}`;
    letterElement.textContent = letter;
    guessElement.appendChild(letterElement);
  });
  
  guessHistory.appendChild(guessElement);
});

socket.on('wordly_next_turn', (data) => {
  const isMyTurn = data.playerId === socket.id;
  gameStatus.textContent = isMyTurn 
    ? 'Ваш ход: угадайте слово соперника' 
    : 'Ход соперника: ожидайте...';

  // отключить ввод для игрока, если не его ход
  guessInput.disabled = !isMyTurn;
  submitGuessBtn.disabled = !isMyTurn;
});

socket.on('wordly_update_words', (words) => {
  if (words[playerId]) {
    myWordDisplay.textContent = words[playerId];
  }
  const opponentId = Object.keys(words).find(id => id !== playerId);
  if (opponentId && words[opponentId]) {
    opponentWordDisplay.textContent = words[opponentId];
  }
});

socket.on('wordly_error', (data) => {
  gameStatus.textContent = `Ошибка: ${data.message}`;
});