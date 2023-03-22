import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SudokuComponent } from './component/sudoku/sudoku.component';

const routes: Routes = [
  { path: '', redirectTo: 'sudoku', pathMatch: 'full' },
  { path: 'sudoku', component: SudokuComponent },
  { path: '*', redirectTo: 'sudoku', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
