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
  eachNumberCount: NumberCount;
  allNumberCount: number;
  errorCount: number = 0;
  numberArr: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  sudokuOriginalList: Sudoku;
  randomSudoku: SudokuDetail[];
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

  // 刷新數獨
  onRefresh(): void{
    const random: number = Math.floor(Math.random() * this.MAX_SUDOKU_INDEX);
    this.randomSudoku = this.sudokuOriginalList[random];
    this.reFreshAllCounter();
    this.sudoku = this.reformatSudokuRow(JSON.parse(JSON.stringify(this.randomSudoku)));
    this.resetSudoku = JSON.parse(JSON.stringify(this.sudoku));
    this.resetTime();
  }

  reFreshAllCounter(){
    this.errorCount = 0;
    this.allNumberCount = this.counter(this.randomSudoku);
    this.eachNumberCount = this.checkNumberCount(this.randomSudoku, NumberCounter.createNumberCounter());
  }

  // 將 Sudoku[] 轉換為 Sudoku[][]
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

  // 計算已填總數字(81個)
  counter(data: SudokuDetail[]): number {
    return data.filter((detail) => detail.value === '').length;
  }

  // 計算 1-9 各別數字已使用次數
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

  // 計時開始
  onStart(): void {
    this.time = 1;
    this.startTime = Date.now();
    this.timer$ = timer(0, 1000).pipe(
      startWith(0),
      map(() => Math.round((Date.now() - this.startTime)))
    )
    this.timerSubscription = this.timer$.subscribe(time => {
      this.time = time;
    });
  }

  // 同局重新開始
  onReSet(): void {
    this.sudoku = JSON.parse(JSON.stringify(this.resetSudoku));
    this.reFreshAllCounter();
    this.resetTime();
  }

  // 重置或停止時間
  resetTime(reset: boolean = true) {
    if(this.timerSubscription){
      this.timerSubscription.unsubscribe();
      this.time = reset ? 0 : this.time;
    }
  }

  // 處理輸入的值
  handleInput(e: Event, sudokuDetail: SudokuDetail): void {
    const inputElement: HTMLInputElement = e.target as HTMLInputElement;
    const currentRow: number = this.getRowOrColIndex(inputElement.classList[0], 1);
    const currentCol: number = this.getRowOrColIndex(inputElement.classList[0], 2);

    inputElement.value = inputElement.value
      .trim()
      .replace(/[^1-9]/g, '');

    // 當原本輸入正確的值刪除，需將總數量加 1 其對應的數字計數也要加 1;
    if(this.sudoku[currentRow][currentCol].value && !inputElement.value){
      this.allNumberCount++;
      this.eachNumberCount[this.sudoku[currentRow][currentCol].value]++;
      this.sudoku[currentRow][currentCol].value = '';
      return;
    }

    if(!inputElement.value) {
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
      this.duplicateCounter(sudokuDetail);
    } else {
      this.sudoku[currentRow][currentCol].value = inputElement.value;
      this.eachNumberCount = this.checkNumberCount(inputElement.value, this.eachNumberCount);
      inputElement.value = '';
      this.allNumberCount--;
      sudokuDetail.isError = false;
    }
    if(this.allNumberCount === 0){
     this.resetTime(false);
    }
  }

  // 獲取輸入值的行與列
  getRowOrColIndex(className: string, i: number): number {
    return +className.split('-')[i];
  }

  // 檢查行(-)是否有重覆值
  isRowDuplicateValues(rowIndex: number, value: string): boolean {
    return this.sudoku[rowIndex].some(detail => detail.value === value);
  }

  // 檢查列(|)是否有重覆值
  isColDuplicateValues(colIndex: number, value: string): boolean {
    for (let [i, v] of this.sudoku.entries()) {
      if(this.sudoku[i][colIndex].value === value){
        return true
      }
    }
    return false;
  }

  // 檢查 9 宮格是否有重覆值
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

  // 若有重覆值計算: 錯誤次數，若大於等於 3，停止時間
  duplicateCounter(sudokuDetail: SudokuDetail): void {
    this.errorCount++;
    sudokuDetail.isError = true;
    if(this.errorCount >= 3){
      this.resetTime(false);
    }
  }

}

