import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, switchMap, throwError, from } from 'rxjs';
import { AuthStore } from '../store/auth/auth.store';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authStore = inject(AuthStore);
  
  // Skip auth header for login and refresh endpoints
  const skipAuthPaths = [
    environment.apiEndpoints.auth.login,
    environment.apiEndpoints.auth.refresh
  ];
  
  const shouldSkipAuth = skipAuthPaths.some(path => req.url.includes(path));
  
  if (shouldSkipAuth) {
    return next(req);
  }
  
  const token = authStore.accessToken();
  
  // Add Authorization header if token exists
  const authReq = token 
    ? req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      })
    : req;
  
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle 401 Unauthorized responses
      if (error.status === 401 && token) {
        // Attempt to refresh token
        return from(authStore.refreshAccessToken()).pipe(
          switchMap(success => {
            if (success) {
              // Retry original request with new token
              const newToken = authStore.accessToken();
              const retryReq = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${newToken}`
                }
              });
              return next(retryReq);
            } else {
              // Refresh failed, redirect to login
              authStore.logout();
              return throwError(() => error);
            }
          }),
          catchError(() => {
            authStore.logout();
            return throwError(() => error);
          })
        );
      }
      
      return throwError(() => error);
    })
  );
};