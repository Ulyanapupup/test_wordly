// static/game_wordly.js
const socket = io();

const roomCode = window.roomCode;
const isCreator = window.isCreator;
const sessionId = window.sessionId;

socket.emit('wordly_join', { room: roomCode, session_id: sessionId });

socket.on('wordly_update', (data) => {
  document.getElementById('playerCount').innerText = data.players;
  const status = document.getElementById('status');
  
  if (data.players < 2) {
    status.innerText = 'Ожидаем второго игрока...';
    document.getElementById('waitingForPlayers').style.display = 'block';
  } else if (data.words_submitted < 2) {
    status.innerText = 'Ожидаем, когда оба игрока введут слова...';
    document.getElementById('waitingForPlayers').style.display = 'none';
  } else {
    // Перенаправляем в игровой режим
    window.location.href = `/game_mode_2_2?room=${roomCode}`;
  }
});

socket.on('wordly_player_left', () => {
  alert('Соперник покинул игру');
  window.location.href = '/room_setup2';
});