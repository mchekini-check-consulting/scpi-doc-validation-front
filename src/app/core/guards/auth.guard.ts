import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../service/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  const hasSeenSplash = sessionStorage.getItem('splashShown');

  if (!hasSeenSplash) {
    sessionStorage.setItem('splashShown', 'true'); 
    router.navigate(['/splash']);
    return false;
  }

  return true;
};
