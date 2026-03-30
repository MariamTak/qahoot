import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { AuthService } from '../services/auth';

export const isAuthenticatedGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.getConnectedUser().pipe(
    map((user) => {
      if (!user) {
        router.navigateByUrl('/login');
        return false;
      }
      return true;
    })
  );
};