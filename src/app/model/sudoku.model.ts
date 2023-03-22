export interface Sudoku {
  [i: string]: SudokuDetail[],
}

export interface SudokuDetail {
  isInit: boolean,
  isError: boolean,
  value: string,
}
export interface NumberCount {
  [i: string]: number;
}

export class NumberCounter {

  constructor(){}

  static createNumberCounter(): NumberCount {
    return {
      "1": 9,
      "2": 9,
      "3": 9,
      "4": 9,
      "5": 9,
      "6": 9,
      "7": 9,
      "8": 9,
      "9": 9,
    }
  }

}
