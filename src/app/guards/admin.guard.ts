import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map } from 'rxjs';

export const adminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  // 👈 Le preguntamos a Supabase el rol en tiempo real
  return authService.getUserRole().pipe(
    map(rol => {
      if (rol === 'admin') {
        return true; // Pasa el jefe
      } else {
        router.navigate(['/pos']); // Rebota al empleado
        return false;
      }
    })
  );
};