const lengthInput = document.getElementById('lengthInput');
const startBtn = document.getElementById('start');
const gameArea = document.getElementById('gameArea');
const userNumberInput = document.getElementById('userNumberInput');
const submitUser  = document.getElementById('submitUser  Number');
const guessInput = document.getElementById('guessInput');
const submitGuessBtn = document.getElementById('submitGuess');
const submitComputerGuessBtn = document.getElementById('submitComputerGuess');
const historyList = document.getElementById('historyList');
const guessDisplay = document.getElementById('guessDisplay');
const computerGuessDisplay = document.getElementById('computerGuessDisplay');

let userSecretNumber = '';
let computerSecretNumber = '';
let numberLength = 4;
let computerGuess = '';

startBtn.addEventListener('click', () => {
    numberLength = parseInt(lengthInput.value, 10);

    if (isNaN(numberLength) || numberLength < 4 || numberLength > 7) {
        alert('Пожалуйста, выберите длину от 4 до 7.');
        return;
    }

    computerSecretNumber = generateSecretNumber(numberLength);
    console.log('Загаданное число компьютера:', computerSecretNumber); // для отладки, можно убрать

    historyList.innerHTML = '';
    guessDisplay.innerHTML = '';
    userNumberInput.value = '';
    guessInput.value = '';
    computerGuessDisplay.innerHTML = '';
    gameArea.classList.remove('hidden');

    alert(`Игра началась! Угадайте число компьютера из ${numberLength} цифр. Удачи!`);
    userNumberInput.focus();
});

submitGuessBtn.addEventListener('click', () => {
    const guess = guessInput.value.trim();

    if (guess.length !== numberLength) {
        alert(`Введите число ровно из ${numberLength} цифр.`);
        return;
    }

    if (!/^\d+$/.test(guess)) {
        alert('Введите только цифры.');
        return;
    }

    // Отобразить введённое число в ячейках с подсветкой совпадений
    displayGuess(guess, guessDisplay, computerSecretNumber);

    // Добавить в историю с подсветкой
    displayGuessInHistory(guess, computerSecretNumber);

    if (guess === computerSecretNumber) {
        alert('Поздравляем! Вы угадали число компьютера! 🎉');
        resetGame();
        return;
    }

    // Компьютер делает попытку угадать число пользователя
    computerGuess = generateSecretNumber(numberLength);
    displayGuess(computerGuess, computerGuessDisplay, userSecretNumber);
    alert(`Компьютер пытается угадать: ${computerGuess}`);

    if (computerGuess === userSecretNumber) {
        alert('Компьютер угадал ваше число! 😱');
        resetGame();
        return;
    }

    guessInput.value = '';
    guessInput.focus();
});

function generateSecretNumber(length) {
    let result = '';
    for (let i = 0; i < length; i++) {
        result += Math.floor(Math.random() * 10);
    }
    return result;
}

function displayGuess(guess, displayElement, secretNumber) {
    displayElement.innerHTML = '';
    const secretNumberArray = secretNumber.split('');
    const guessArray = guess.split('');
    const correctPositions = new Array(secretNumber.length).fill(false);
    const correctDigits = new Array(secretNumber.length).fill(false);

    // Первая итерация: проверка на правильные позиции (зеленый)
    for (let i = 0; i < guessArray.length; i++) {
        const cell = document.createElement('div');
        cell.className = 'number-cell';
        cell.textContent = guessArray[i];

        if (guessArray[i] === secretNumberArray[i]) {
            cell.classList.add('correct');
            correctPositions[i] = true;
            correctDigits[i] = true; // Помечаем цифру как угаданную
        }
        displayElement.appendChild(cell);
    }

    // Вторая итерация: проверка на присутствие цифры в загаданном числе (желтый)
    for (let i = 0; i < guessArray.length; i++) {
        if (!correctPositions[i]) { // Проверяем только те, которые не угаданы
            for (let j = 0; j < secretNumberArray.length; j++) {
                if (guessArray[i] === secretNumberArray[j] && !correctDigits[j]) {
                    const cell = displayElement.children[i];
                    cell.classList.add('yellow'); // Добавляем желтую подсветку
                    correctDigits[j] = true; // Помечаем цифру как использованную
                    break; // Выходим из внутреннего цикла
                }
            }
        }
    }
}

function resetGame() {
    userSecretNumber = '';
    computerSecretNumber = '';
    historyList.innerHTML = '';
    guessDisplay.innerHTML = '';
    computerGuessDisplay.innerHTML = '';
    userNumberInput.value = '';
    guessInput.value = '';
    gameArea.classList.add('hidden');
}

function displayGuessInHistory(guess, secretNumber) {
    const row = document.createElement('div');
    row.className = 'history-row'; // Новый класс для строки истории
    const secretNumberArray = secretNumber.split('');
    const guessArray = guess.split('');
    const correctPositions = new Array(secretNumber.length).fill(false);
    const correctDigits = new Array(secretNumber.length).fill(false);

    // Первая итерация: проверка на правильные позиции (зеленый)
    for (let i = 0; i < guessArray.length; i++) {
        const cell = document.createElement('span');
        cell.className = 'number-cell';
        cell.textContent = guessArray[i];

        if (guessArray[i] === secretNumberArray[i]) {
            cell.classList.add('correct');
            correctPositions[i] = true;
            correctDigits[i] = true; // Помечаем цифру как угаданную
        }
        row.appendChild(cell);
    }

    // Вторая итерация: проверка на присутствие цифры в загаданном числе (желтый)
    for (let i = 0; i < guessArray.length; i++) {
        if (!correctPositions[i]) { // Проверяем только те, которые не угаданы
            for (let j = 0; j < secretNumberArray.length; j++) {
                if (guessArray[i] === secretNumberArray[j] && !correctDigits[j]) {
                    const cell = row.children[i];
                    cell.classList.add('yellow'); // Добавляем желтую подсветку
                    correctDigits[j] = true; // Помечаем цифру как использованную
                    break; // Выходим из внутреннего цикла
                }
            }
        }
    }

    historyList.appendChild(row);
}

