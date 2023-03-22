import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, of, switchMap } from "rxjs";
import { Sudoku, SudokuDetail } from "../model/sudoku.model";

@Injectable({
  providedIn: 'root'
})
export class SudokuService {

  constructor(private http: HttpClient ) { }

  getSudokuData(): Observable<Sudoku>{
   return this.http.get<Sudoku>('assets/sudoku-data-obj.mock.json').pipe(
    switchMap((data: Sudoku) => this.reformatSudoku(data))
   );
  }

  reformatSudoku(data: Sudoku): Observable<Sudoku> {
    let dataCopy: any = structuredClone(data);
    let sudokuList: any[] = [];

    for(let i in dataCopy){
      if(Array.isArray(data[0][0])){
        dataCopy[i] = dataCopy[i].flat(Infinity);
      }
      sudokuList.push(dataCopy[i]);
    }

    for(let list of sudokuList){
      for(let i = 0; i < list.length; i++){
        list[i] = this.reformatSudokuDetail(list[i]);
      }
    }

    return of(dataCopy as Sudoku);
  }

  private reformatSudokuDetail(value: string): SudokuDetail{
    let col: SudokuDetail = {
      isInit: value ? true : false,
      isError: false,
      value: value,
    }
    return col;
  }

}
