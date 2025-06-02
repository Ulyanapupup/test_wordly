// static/game_wordly.js
const socket = io();

const roomCode = window.roomCode;
const isCreator = window.isCreator;
const sessionId = window.sessionId;

const wordSubmission = document.getElementById('wordSubmission');
const secretWordInput = document.getElementById('secretWord');
const submitWordBtn = document.getElementById('submitWord');
const statusElement = document.getElementById('status');

socket.emit('wordly_join', { room: roomCode, session_id: sessionId });

// Обработчик отправки слова
submitWordBtn.addEventListener('click', () => {
  const word = secretWordInput.value.trim();
  if (word.length === 5) {
    socket.emit('wordly_submit_word', { 
      room: roomCode, 
      session_id: sessionId, 
      word: word.toLowerCase() 
    });
    wordSubmission.style.display = 'none';
    statusElement.textContent = 'Слово отправлено. Ожидаем начала игры...';
  } else {
    alert('Слово должно содержать ровно 5 букв');
  }
});

socket.on('wordly_update', (data) => {
  document.getElementById('playerCount').innerText = data.players;
  
  if (data.players < 2) {
    statusElement.textContent = 'Ожидаем второго игрока...';
    document.getElementById('waitingForPlayers').style.display = 'block';
    wordSubmission.style.display = 'none';
  } else {
    // Когда оба игрока подключены, показываем форму для ввода слова
    statusElement.textContent = 'Введите ваше слово (5 букв)';
    wordSubmission.style.display = 'block';
    document.getElementById('waitingForPlayers').style.display = 'none';
  }
});

socket.on('wordly_game_started', () => {
  // Перенаправляем в игровой режим
  window.location.href = `/game_mode_2_2?room=${roomCode}`;
});

socket.on('wordly_player_left', () => {
  alert('Соперник покинул игру');
  window.location.href = '/room_setup2';
});