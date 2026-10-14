import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const adminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  
  // 👇 SOLUCIÓN: Agregamos ": string" para que TypeScript se relaje 👇
  const rolActual: string = 'Admin'; 

  if (rolActual === 'Admin') {
    return true; // Tiene permiso
  } else {
    // No tiene permiso, lo rebotamos al Punto de Venta
    router.navigate(['/pos']); 
    return false;
  }
};