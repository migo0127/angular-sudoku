import { Component, OnInit } from '@angular/core';
import { Observable, Subscription, map, startWith, timer } from 'rxjs';
import { NumberCount, NumberCounter, Sudoku, SudokuDetail } from 'src/app/model/sudoku.model';
import { SudokuService } from 'src/app/service/sudoku.service';

@Component({
  selector: 'app-sudoku',
  templateUrl: './sudoku.component.html',
  styleUrls: ['./sudoku.component.scss']
})
export class SudokuComponent implements OnInit {

  readonly MAX_SUDOKU_INDEX: number = 9;
  startTime: number;
  timer$: Observable<number>;
  timerSubscription: Subscription;
  time: number = 0;
  numberCount: NumberCount;
  count: number;
  errorCount: number = 0;
  number: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  sudokuOriginalList: Sudoku;
  sudoku: SudokuDetail[][];
  resetSudoku: SudokuDetail[][];
  isDuplicate: boolean;

  constructor(private sudokuService: SudokuService) { }

  ngOnInit(): void {
    this.sudokuService.getSudokuData().subscribe((data) => {
      this.sudokuOriginalList = data;
      this.onRefresh();
    });
  }

  onRefresh(): void{
    const random: number = Math.floor(Math.random() * this.MAX_SUDOKU_INDEX);
    const randomSudoku: SudokuDetail[]= this.sudokuOriginalList[random];
    this.count = this.counter(randomSudoku);
    this.numberCount = NumberCounter.createNumberCounter();
    this.numberCount = this.checkNumberCount(randomSudoku, this.numberCount);
    this.sudoku = this.reformatSudokuRow(JSON.parse(JSON.stringify(randomSudoku)));
    this.resetSudoku = JSON.parse(JSON.stringify(this.sudoku));
    this.errorCount = 0;
    this.resetTime();
  }

  reformatSudokuRow(data: SudokuDetail[]): SudokuDetail[][]{
    let dataCopy: any = [...data];
    let newSudoku: SudokuDetail[][] = [];
    for(let i = 0; i < dataCopy.length; i++){
      if(i === 0 || i % 9 === 0){
        newSudoku.push(dataCopy.slice(i, i + 9));
      }
    }
    return newSudoku;
  }

  counter(data: SudokuDetail[]): number {
    return data.filter((detail) => detail.value === '').length;
  }

  checkNumberCount(data: SudokuDetail[] | string, numberCount: NumberCount): NumberCount{
    const NumberCountCopy: NumberCount = { ...numberCount };
    if(typeof data === 'string'){
      NumberCountCopy[data]--;
    }else{
      for(let detail of data){
        if(detail.value){
          NumberCountCopy[detail.value]--;
        }
      }
    }
    return NumberCountCopy;
  }

  onStart(): void {
    this.startTime = Date.now();
    this.timer$ = timer(0, 1000).pipe(
      startWith(0),
      map(() => Math.round((Date.now() - this.startTime)))
    )
    this.timerSubscription = this.timer$.subscribe(time => {
      this.time = time;
    });
  }

  onReSet(): void {
    this.sudoku = JSON.parse(JSON.stringify(this.resetSudoku));
    this.errorCount = 0;
    this.resetTime();
  }

  resetTime(reset: boolean = true) {
    if(this.timerSubscription){
      this.timerSubscription.unsubscribe();
      this.time = reset ? 0 : this.time;
    }
  }

  handleInput(e: Event, sudokuDetail: SudokuDetail): void {
    const inputElement: HTMLInputElement = e.target as HTMLInputElement;
    const currentRow: number = this.getRowOrColIndex(inputElement.classList[0], 1);
    const currentCol: number = this.getRowOrColIndex(inputElement.classList[0], 2);

    inputElement.value = inputElement.value
      .trim()
      .replace(/[^1-9]/g, '')
      .charAt(0);
    if (!inputElement.value) {
      this.sudoku[currentRow][currentCol].value = '';
      return;
    }

    this.isDuplicate =
      this.isRowDuplicateValues(currentRow, inputElement.value) ||
      this.isColDuplicateValues(currentCol, inputElement.value) ||
      this.isGroupDuplicateValues(
        currentRow,
        currentCol,
        inputElement.value
      );

    if (this.isDuplicate) {
      this.duplicateValuesHighLight(sudokuDetail);
    } else {
      this.sudoku[currentRow][currentCol].value = inputElement.value;
      this.numberCount = this.checkNumberCount(inputElement.value, this.numberCount);
      inputElement.value = '';
      this.count--;
      sudokuDetail.isError = false;
      console.log(this.numberCount);
    }
    if(this.count === 0){
     this.resetTime();
    }
  }

  getRowOrColIndex(className: string, i: number): number {
    return +className.split('-')[i];
  }

  isRowDuplicateValues(rowIndex: number, value: string): boolean {
    return this.sudoku[rowIndex].some(detail => detail.value === value);
  }

  isColDuplicateValues(colIndex: number, value: string): boolean {
    for (let [i, v] of this.sudoku.entries()) {
      if(this.sudoku[i][colIndex].value === value){
        return true
      }
    }
    return false;
  }

  isGroupDuplicateValues(
    rowIndex: number,
    colIndex: number,
    value: string
  ): boolean {
    let isDuplicate: boolean = false;
    const startRow: number = rowIndex < 3 ? 0 : rowIndex < 6 ? 3 : 6;
    const startCol: number = colIndex < 3 ? 0 : colIndex < 6 ? 3 : 6;
    const detectCol: number = 3;
    for (let i = startRow; i < startRow + detectCol; i++) {
      for (let j = startCol; j < startCol + detectCol; j++) {
        isDuplicate = this.sudoku[i][j].value === value;
        if (isDuplicate) return isDuplicate;
      }
    }
    return isDuplicate;
  }

  duplicateValuesHighLight(sudokuDetail: SudokuDetail): void {
    this.errorCount++;
    sudokuDetail.isError = true;
    if(this.errorCount >= 3){
      this.resetTime(false);
    }
  }

}
