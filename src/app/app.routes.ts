import { Routes } from '@angular/router';
// import { authGuard } from './guards/auth-guard'; // Lo comentamos hasta que Karime suba este archivo

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then(m => m.LoginComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.DashboardComponent),
    // canActivate: [authGuard] 
  },
  {
    path: 'clientes',
    loadComponent: () => import('./pages/clientes/clientes').then(m => m.Clientes),
    // canActivate: [authGuard]
  },
  {
    path: 'reservaciones',
    loadComponent: () => import('./pages/reservaciones/reservaciones').then(m => m.Reservaciones),
    // canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];