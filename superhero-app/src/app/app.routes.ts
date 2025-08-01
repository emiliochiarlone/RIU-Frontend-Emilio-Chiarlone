import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'heroes',
    data: { title: 'Lista de Heroes' },
    loadComponent: () => import('./heroes/hero-list/hero-list.component').then(m => m.HeroListComponent)
  },
  {
    path: 'heroes/edit/:id',
    data: { title: 'Editar Héroe' },
    loadComponent: () => import('./heroes/hero-form/hero-form.component').then(m => m.HeroFormComponent)
  },
  {
    path: 'heroes/create',
    data: { title: 'Crear Héroe' },
    loadComponent: () => import('./heroes/hero-form/hero-form.component').then(m => m.HeroFormComponent)
  },
  {
    path:'',
    redirectTo: 'heroes',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'heroes',
    pathMatch: 'full'
  }
];
