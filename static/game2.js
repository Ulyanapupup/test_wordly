const socket = io();

const roomCode = window.roomCode;
const sessionId = window.sessionId;

// Подключаемся к комнате
socket.emit('join_game_room', { room: roomCode, session_id: sessionId });

socket.on('joined', (data) => {
  console.log(data.message);
  document.getElementById('status').innerText = data.message;
});

socket.on('roles_updated', (data) => {
  const roles = data.roles;
  console.log('Обновлены роли:', roles);
  
  // Показываем кнопку "Начать игру" если обе роли выбраны
  if (roles.guesser && roles.creator) {
    document.getElementById('startGameDiv').style.display = 'block';
  } else {
    document.getElementById('startGameDiv').style.display = 'none';
  }
});

socket.on('role_taken', (data) => {
  alert(`Роль "${data.role}" уже занята другим игроком!`);
});

socket.on('redirect', (data) => {
  window.location.href = data.url;
});

socket.on('player_left', () => {
  alert('Другой игрок покинул комнату. Игра завершена.');
  window.location.href = '/index1';
});

socket.on('force_leave', () => {
  window.location.href = '/index1';
});

function selectRole(role) {
  socket.emit('select_role', { 
    room: roomCode, 
    session_id: sessionId, 
    role: role 
  });
}

function startGame() {
  socket.emit('start_game', { 
    room: roomCode, 
    session_id: sessionId 
  });
}

function leaveGame() {
  socket.emit('leave_game', { 
    room: roomCode, 
    session_id: sessionId 
  });
  window.location.href = '/index1';
}