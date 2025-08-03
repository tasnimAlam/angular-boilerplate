import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from '../store/auth/auth.store';

export const loginGuard: CanActivateFn = () => {
  const authStore = inject(AuthStore);
  const router = inject(Router);
  
  if (authStore.isAuthenticated() && authStore.hasValidToken()) {
    router.navigate(['/dashboard']);
    return false;
  }
  
  return true;
};