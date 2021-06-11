"use strict";

const ROW_COUNT = 10;
const COLUMN_COUNT = 10;
const GAMER_COUNT = 2;
const NAME_PREFIX = 'Gamer';
const plaingArea = document.querySelector(`.playing-area`);
const congratulationsModal = document.querySelector(`.congratulations-modal`);
const gamerTemplate = document.querySelector(`#gamer`).content.querySelector(`.game__gamer`);
const gamerBoard = document.querySelector(`.game__participants`);
const buttonRestart = document.querySelector(`.congratulations-modal__button-yes`);
const buttonNoRestart = document.querySelector(`.congratulations-modal__button-no`);
const WIN_COMBINATION = 5;
const WIN_DETECTED = 1000;
let gamers = new Array();
let currentGamer = 0;
let board = [];



(function initializationRun() {
  for (let i = 0; i < ROW_COUNT; i++) {
    let tableRow = document.createElement('tr');
    board[i] = [];
    for (let j = 0; j < COLUMN_COUNT; j++) {
      let tableCell = document.createElement('td');
      tableCell.classList.add('playing-area__cell');
      let cellObj = {
        td: tableCell,
        x: i,
        y: j
      };
      let cellHandler = onCellClick.bind(cellObj);
      tableCell.addEventListener('click', cellHandler);
      tableRow.appendChild(tableCell);
      board[i][j] = {
        cellObj: cellObj,
        cellHandler: cellHandler
      };
    }
    plaingArea.appendChild(tableRow);
  }
  for (let i = 0; i < GAMER_COUNT; i++) {

    let gamerName = `${NAME_PREFIX}${i}`;
    if (i == 0) {
      gamerName = 'You';
    }
    let gamerColor = window.util.getRandomColor();
    createGamer(gamerName, gamerColor, 0);
    gamers.push(new Gamer(gamerName, gamerColor));
  }
  buttonRestart.addEventListener('click', restartGame);
  buttonNoRestart.addEventListener('click', closeModal);
})();

function closeModal() {
  congratulationsModal.classList.remove(`congratulations-modal--show`);
}
function restartGame() {
  for (let i = 0; i < ROW_COUNT; i++) {
    for (let j = 0; j < COLUMN_COUNT; j++) {
      let cellObj = {
        td: board[i][j].cellObj.td,
        x: i,
        y: j
      };
      let cellHandler = onCellClick.bind(cellObj);
      board[i][j].cellObj.td.style.background = "";
      board[i][j].cellObj.td.addEventListener('click', cellHandler);
      board[i][j] = {
        cellObj: cellObj,
        cellHandler: cellHandler
      };
      for (let k = board[i][j].cellObj.td.classList.length - 1; k > 0; k--) {
        let cellIsfill = gamers.some(function (gamer) {
          return gamer.name == board[i][j].cellObj.td.classList[k]
        });
        if (cellIsfill) {
          board[i][j].cellObj.td.classList.remove(board[i][j].cellObj.td.classList[k]);
        }
      }
    }
  }
  for (let i = 0; i < gamers.length; i++) {
    gamers[i].moveCount = 0;
    updateUserBoard();
  }
  congratulationsModal.classList.remove(`congratulations-modal--show`);
}
function createGamer(name, color, score) {
  let newGamer = gamerTemplate.cloneNode(true);
  for (let j = 0; j < newGamer.children.length; j++) {
    if (newGamer.children[j].classList.contains('game__gamer-name')) {
      newGamer.children[j].textContent = name;
    }
    if (newGamer.children[j].classList.contains('game__gamer-score')) {
      newGamer.children[j].textContent = score;
    }
    newGamer.style.background = color;
  }
  gamerBoard.appendChild(newGamer);
}
function onCellClick() {
  this.td.classList.add('playing-area__cell--disable');
  this.td.classList.add(gamers[currentGamer].name);
  this.td.style.background = gamers[currentGamer].color;
  this.td.removeEventListener('click', board[this.x][this.y].cellHandler);
  gamers[currentGamer].moveCount++;
  updateUserBoard();
  if (checkWin(board, this.x, this.y)) {
    startFreezing();
    showWinModal(gamers[currentGamer].name);
    return;
  }
  if (currentGamer + 1 >= gamers.length) {
    currentGamer = 0;
  }
  else {
    currentGamer++;
  }
  if (currentGamer > 0) {
    artificialIntelligenceRun();
  }
}
function updateUserBoard() {
  let gamersFound = gamerBoard.querySelectorAll(`.game__gamer`)
  for (let i = gamersFound.length - 1; i >= 0; i--) {
    gamersFound[i].remove();
  }
  for (let i = 0; i < gamers.length; i++) {
    createGamer(gamers[i].name, gamers[i].color, gamers[i].moveCount);
  }
}
function artificialIntelligenceRun() {
  let bestMove = {
    x: 0,
    y: 0,
    evaluate: 0
  }
  for (let i = 0; i < ROW_COUNT; i++) {
    for (let j = 0; j < COLUMN_COUNT; j++) {
      let evaluate = evaluateMove(board, i, j, gamers[currentGamer])
      if (bestMove.evaluate < evaluate) {
        bestMove.evaluate = evaluate;
        bestMove.x = i;
        bestMove.y = j;
        bestMove.td = board[i][j].cellObj.td
      }
    }
  }
  onCellClick.bind(bestMove)();
}

function startFreezing() {
  for (let i = 0; i < ROW_COUNT; i++) {
    for (let j = 0; j < COLUMN_COUNT; j++) {
      board[i][j].cellObj.td.removeEventListener('click', board[i][j].cellHandler);
    }
  }
}

function showWinModal(gamer) {
  congratulationsModal.classList.add(`congratulations-modal--show`);
  let gamerName = congratulationsModal.querySelector(`.congratulations-modal__gamer`);
  gamerName.textContent = gamer;
}

function checkWin(board, x, y,) {
  const Directions = getDirections(board, x, y)
  for (let i = 0; i < 4; i++) { //Проверяем все 4 направления
    if (checkDirections(Directions[i])) {
      return true
    }
  }
}

function getDirections(board, x, y) { //Генерируем направления
  const Directions = [[], [], [], []];
  for (let i = -4; i < WIN_COMBINATION; i++) {
    if (x + i >= 0 && x + i <= ROW_COUNT - 1) {
      Directions[0].push(board[x + i][y])
      if (y + i >= 0 && y + i <= COLUMN_COUNT - 1) {
        Directions[2].push(board[x + i][y + i])
      }
    }
    if (y + i >= 0 && y + i <= COLUMN_COUNT - 1) {
      Directions[1].push(board[x][y + i])
      if (x - i >= 0 && x - i <= ROW_COUNT - 1) {
        Directions[3].push(board[x - i][y + i])
      }
    }
  }
  return Directions
}

function checkDirections(arr) {
  for (let i = 0; i < arr.length - WIN_COMBINATION + 1; i++) {
    if (arr[i].cellObj.td.classList.contains(gamers[currentGamer].name)
      && arr[i + 1].cellObj.td.classList.contains(gamers[currentGamer].name)
      && arr[i + 2].cellObj.td.classList.contains(gamers[currentGamer].name)
      && arr[i + 3].cellObj.td.classList.contains(gamers[currentGamer].name)
      && arr[i + 4].cellObj.td.classList.contains(gamers[currentGamer].name)) {
      return true
    }
  }
}

function evaluateMove(Board, x, y, player) {
  let validDirection = gamers.every(function (gamer) {
    return !Board[x][y].cellObj.td.classList.contains(gamer.name);
  });
  if (!validDirection) { return 0; }
  let score = 0;
  const Directions = getDirections(Board, x, y);
  let temp_score;
  for (let i = 0; i < 4; i++) {
    temp_score = evaluateDirection(Directions[i], player);
    if (temp_score === WIN_DETECTED) { //если данный ход выигрывает игру, сразу же возвращаем его
      return WIN_DETECTED
    } else {
      score += temp_score
    }
  }
  return score;
}

function evaluateDirection(direction_arr, player) {
  let score = 0;
  for (let i = 0; (i + 4) < direction_arr.length; i++) {
    let you = 0;
    let enemy = 0;
    for (let j = 0; j <= 4; j++) {
      let youInDirection = gamers.slice(1).some(function (gamer) {
        return direction_arr[i + j].cellObj.td.classList.contains(gamer.name);
      });
      let enemyInDirection = direction_arr[i + j].cellObj.td.classList.contains(player.name);
      if (youInDirection) {
        you++
      } else if (enemyInDirection) {
        enemy++
      }
    }
    score += evalff(getSeq(you, enemy));
    if ((score >= 800000)) {
      return WIN_DETECTED;
    }
  }
  return score
}

function evalff(seq) {
  switch (seq) {
    case 0:
      return 7;
    case 1:
      return 35;
    case 2:
      return 800;
    case 3:
      return 15000;
    case 4:
      return 800000;
    case -1:
      return 15;
    case -2:
      return 400;
    case -3:
      return 1800;
    case -4:
      return 100000;
    case 17:
      return 0;
  }
}

function getSeq(y, e) {
  if (y + e === 0) {
    return 0;
  }
  if (y !== 0 && e === 0) {
    return y
  }
  if (y === 0 && e !== 0) {
    return -e
  }
  if (y !== 0 && e !== 0) {
    return 17
  }
}
