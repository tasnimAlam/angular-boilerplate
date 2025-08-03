import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from '../store/auth/auth.store';

export const authGuard: CanActivateFn = async () => {
  const authStore = inject(AuthStore);
  const router = inject(Router);
  
  // Check if session is valid (also handles token refresh if needed)
  const isValidSession = await authStore.refreshSession();
  
  if (isValidSession) {
    return true;
  }
  
  router.navigate(['/login']);
  return false;
};