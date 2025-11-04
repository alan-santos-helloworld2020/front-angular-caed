import { Routes } from '@angular/router';
import { LancamentosComponent } from './pages/lancamentos/lancamentos/lancamentos.component';

export const routes: Routes = [
    { path: '', pathMatch: 'full', redirectTo: 'lancamentos' },
    { path: 'lancamentos', component: LancamentosComponent },
    { path: '**', redirectTo: 'lancamentos' }
];
