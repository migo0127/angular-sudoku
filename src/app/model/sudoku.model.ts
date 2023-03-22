export interface Sudoku {
  [i: string | number]: SudokuDetail[],
}

export interface SudokuDetail {
  isInit: boolean,
  isError: boolean,
  value: string,
}

