import "./style.css";
import { EMPTY, BOMB, FLAG, colors, buttonImages } from "./constants";

const beginner = document.getElementById("beginner");
const intermediate = document.getElementById("intermediate");
const expert = document.getElementById("expert");
const custom = document.getElementById("custom");
let active = document.querySelector(".navbar__button_active");

const field = document.querySelector(".main__field");
const button = document.querySelector(".main__button");
const bombCounter = document.querySelector(".main__bomb-counter");
const time = document.querySelector(".main__time");

// TO DO receive from user
let y = 9; // rows
let x = 9; // columns
let z = 10; // bombs

let cells;
let values;
let flags;
let isGameOver;

let sec = 0;

// create field with empty cells
function createField(x, y) {
  isGameOver = false;
  cells = [];
  values = [];
  flags = 0;
  bombCounter.textContent = z;

  for (let j = 0; j < y; j++) {
    cells.push([]);
    values.push([]);
    const row = document.createElement("div");
    row.classList.add("main__row");
    for (let i = 0; i < x; i++) {
      cells[j].push(EMPTY);
      values[j].push(EMPTY);
      const cell = document.createElement("div");
      cell.classList.add("main__cell");
      cell.id = `${j}.${i}`;
      cell.textContent = values[j][i];
      addListeners(cell);
      row.append(cell);
    }
    field.append(row);
  }
}

// randomly put bombs to empty cells
function putBombs(z) {
  console.log(x, y, z);
  let bombsOnTheField = 0;
  while (bombsOnTheField < z) {
    const cellNum = Math.floor(Math.random() * x * y);
    const i = Math.floor(cellNum / x);
    const j = cellNum % x;
    console.log("x, y:", x, y);
    console.log("i, j:", i, j);
    if (cells[i][j] === EMPTY) {
      cells[i][j] = "bomb";
      bombsOnTheField++;
    }
  }
}

function startNewGame() {
  document.querySelectorAll(".main__row").forEach((row) => {
    row.remove();
  });
  button.classList.remove(buttonImages.win);
  createField(x, y);
  putBombs(z);
  button.classList.remove(buttonImages.stop);
  sec = 0;
  time.textContent = "000";
}

// change game settings
function changeActiveSetting() {
  active = document.querySelector(".navbar__button_active");
  active.classList.remove("navbar__button_active");
  this.classList.add("navbar__button_active");
  active = this;
  switch (active.id) {
    case "beginner": {
      y = 9; // rows
      x = 9; // columns
      z = 10; // bombs
      break;
    }
    case "intermediate": {
      y = 16; // rows
      x = 16; // columns
      z = 40; // bombs
      break;
    }
    case "expert": {
      y = 16; // rows
      x = 30; // columns
      z = 99; // bombs
      break;
    }
    default: {
      break;
    }
  }
  startNewGame();
}

beginner.addEventListener("click", changeActiveSetting);
intermediate.addEventListener("click", changeActiveSetting);
expert.addEventListener("click", changeActiveSetting);

// count bombs in the adjacent cells
function countBombsAround(y, x) {
  let counter = 0;
  for (let i = y - 1; i < y + 2; i++) {
    if (i >= 0 && i < cells.length) {
      for (let j = x - 1; j < x + 2; j++) {
        if (j >= 0 && j < cells[i].length) {
          if (cells[i][j] === "bomb") {
            counter++;
          }
        }
      }
    }
  }
  values[y][x] = counter;

  // update cell value and remove listeners
  const cell = document.getElementById(`${y}.${x}`);
  cell.classList.add(colors[0]);
  cell.disabled = true;
  if (counter > 0) {
    cell.textContent = counter;
    cell.classList.add(colors[counter]);
  }

  // cell.removeEventListener("click", openCell);
  // cell.removeEventListener("contextmenu", toggleFlag);

  if (counter === 0) {
    openAdjacentCells(y, x);
  }
}

// show all bombs when game is over (you lost)
function openAllBombs() {
  for (let i = 0; i < y; i++) {
    for (let j = 0; j < x; j++) {
      if (cells[i][j] === "bomb") {
        const cell = document.getElementById(`${i}.${j}`);
        cell.classList.add(BOMB);
      }
    }
  }
}

// show all flags (instead of bombs) when game is over (you win)
function openAllFlags() {
  for (let i = 0; i < y; i++) {
    for (let j = 0; j < x; j++) {
      if (cells[i][j] === "bomb") {
        const cell = document.getElementById(`${i}.${j}`);
        cell.classList.add(FLAG);
      }
    }
  }
}

// if the cell has no bombs around it, open all adjacent cells
function openAdjacentCells(y, x) {
  for (let i = y - 1; i < y + 2; i++) {
    if (i >= 0 && i < cells.length) {
      for (let j = x - 1; j < x + 2; j++) {
        if (j >= 0 && j < cells[i].length) {
          if ((i !== y || j !== x) && values[i][j] === EMPTY) {
            countBombsAround(i, j);
          }
        }
      }
    }
  }
}

// handles left mouse click on the cell - opens the cell if it's not a flag
function openCell(e) {
  if (sec === 0) {
    sec++;
    // start timer after first opened cell
    let timer = setInterval(updateTime, 1000);
    function updateTime() {
      if (sec < 1000 && sec > 0 && !isGameOver) {
        time.textContent = "0".repeat(3 - String(sec).length) + sec;
        sec++;
      } else {
        clearInterval(timer);
      }
    }
  }

  if (!isGameOver) {
    const [y, x] = e.target.id.split(".").map((num) => Number(num));

    if (values[y][x] !== "flag") {
      if (cells[y][x] === "bomb") {
        // if this is first turn - change bomb's place
        if (document.querySelectorAll(".main__cell_opened").length === 0) {
          putBombs(1);
          cells[y][x] = EMPTY;
          countBombsAround(y, x);
        } else {
          e.target.classList.add(BOMB);
          button.classList.add(buttonImages.stop);
          isGameOver = true;
          openAllBombs();
          clearInterval(timer);
        }
      } else if (cells[y][x] === EMPTY) {
        countBombsAround(y, x);
      }
    }
    isFull();
  }
}

// handle right mouse click on the cell (changes state of the flag)
function toggleFlag(e) {
  e.preventDefault(); // we need to prevent context menu from showing
  if (!isGameOver) {
    const [y, x] = e.target.id.split(".").map((num) => Number(num));
    if (values[y][x] === "flag") {
      values[y][x] = EMPTY;
      e.target.classList.remove(FLAG);
      flags--;
      bombCounter.textContent = Number(bombCounter.textContent) + 1;
    } else if (values[y][x] === EMPTY) {
      values[y][x] = "flag";
      e.target.classList.add(FLAG);
      flags++;
      bombCounter.textContent = Number(bombCounter.textContent) - 1;
    }
  }
}

function isFull() {
  const cellsOpened = document.querySelectorAll(".main__cell_opened");
  if (cellsOpened.length === y * x - z) {
    button.classList.add(buttonImages.win);
    openAllFlags();
    isGameOver = true;
    bombCounter.textContent = 0;
  }
}

function addListeners(cell) {
  cell.addEventListener("click", openCell);
  cell.addEventListener("contextmenu", toggleFlag);
  cell.addEventListener("mousedown", (e) => {
    if (e.button === 0) {
      button.classList.add(buttonImages.reaction);
    }
  });
  cell.addEventListener("mouseup", () => {
    button.classList.remove(buttonImages.reaction);
  });
  cell.addEventListener("mouseout", () => {
    button.classList.remove(buttonImages.reaction);
  });
}

button.addEventListener("click", startNewGame);

startNewGame();
