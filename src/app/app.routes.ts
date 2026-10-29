import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard'; // Lo comentamos hasta que Karime suba este archivo
import { adminGuard } from './guards/admin.guard'; // 👈 ¡NUEVO! Importamos a tu cadenero
import { NuevoProductoComponent } from './nuevo-producto/nuevo-producto'; // 👈 Importamos tu nueva pantalla

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
    loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.Dashboard),
    canActivate: [adminGuard] // 👈 ¡Protegido! Solo pasa el Admin
  },
  {
    path: 'clientes',
    loadComponent: () => import('./pages/clientes/clientes').then(m => m.ClientesComponent),
    canActivate: [adminGuard] // 👈 ¡Protegido! Solo pasa el Admin
  },
  {
    path: 'reservaciones',
    loadComponent: () => import('./pages/reservaciones/reservaciones').then(m => m.Reservaciones),
    canActivate: [adminGuard] // 👈 ¡Protegido! El cajero tampoco debería ver esto
  },
  
  // 👇 RUTA DEL PUNTO DE VENTA (Acceso libre para el Cajero) 👇
  { 
    path: 'pos', 
    loadComponent: () => import('./pages/pos/pos').then(m => m.PosComponent), 
    // Aquí NO ponemos el adminGuard porque el cajero sí debe entrar
  },
  {
    path: 'inventario',
    loadComponent: () => import('./pages/inventario/inventario').then(m => m.InventarioComponent),
    canActivate: [adminGuard]
  },

  // 👇 RUTA NUEVA: Alta de productos con escáner y foto 👇
  {
    path: 'nuevo-producto',
    component: NuevoProductoComponent,
    canActivate: [adminGuard] // Protegido: Solo la administradora puede agregar productos
  },
  
  {
    path: '**',
    redirectTo: 'login'
  }
];