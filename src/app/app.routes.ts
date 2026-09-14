import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'clientes',
    loadComponent: () => import('./pages/clientes/clientes.component').then(m => m.ClientesComponent),
    canActivate: [authGuard]
  },
  {
    path: 'reservaciones',
    loadComponent: () => import('./pages/reservaciones/reservaciones.component').then(m => m.ReservacionesComponent),
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];