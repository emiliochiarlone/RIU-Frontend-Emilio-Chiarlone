import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'heroes',
    loadComponent: () => import('./heroes/hero-list/hero-list.component').then(m => m.HeroListComponent)
  }
];
