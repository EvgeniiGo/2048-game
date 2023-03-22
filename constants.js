const EMPTY = ""; // empty cell
const BOMB = "main__cell_bomb"; // bomb cell
const FLAG = "main__cell_flag"; // flag cell

const colors = {
  0: "main__cell_opened",
  1: "main__cell_blue",
  2: "main__cell_green",
  3: "main__cell_red",
  4: "main__cell_darkblue",
  5: "main__cell_darkred",
  6: "main__cell_purple",
  7: "main__cell_orange",
  8: "main__cell_black",
};

const buttonImages = {
  reaction: "main__button_reaction",
  stop: "main__button_stopped",
  win: "main__button_win",
};

export { EMPTY, BOMB, FLAG, colors, buttonImages };
