import { Injectable, inject, computed } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { BaseStore } from '../base/base.store';
import { AuthState, User } from '../base/store.interfaces';
import { environment } from '../../../../environments/environment';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface TokenResponse {
  access: string;
  refresh: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthStore extends BaseStore<AuthState> {
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);
  
  // API URLs from environment
  private readonly apiUrl = environment.apiUrl;
  private readonly loginUrl = `${this.apiUrl}${environment.apiEndpoints.auth.login}`;
  private readonly refreshUrl = `${this.apiUrl}${environment.apiEndpoints.auth.refresh}`;
  
  // Public selectors
  readonly isAuthenticated = this.createSelector(state => state.isAuthenticated);
  readonly currentUser = this.createSelector(state => state.currentUser);
  readonly accessToken = this.createSelector(state => state.accessToken);
  readonly refreshToken = this.createSelector(state => state.refreshToken);
  readonly isLoading = this.createSelector(state => state.isLoading);
  readonly error = this.createSelector(state => state.error);
  
  // Computed selectors
  readonly userName = computed(() => this.currentUser()?.username || '');
  readonly isLoggedIn = computed(() => this.isAuthenticated() && this.currentUser() !== null);
  readonly hasValidToken = computed(() => this.accessToken() !== null);
  
  protected get initialState(): AuthState {
    return {
      isAuthenticated: false,
      currentUser: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,
      error: null
    };
  }
  
  protected get storeName(): string {
    return 'AUTH';
  }
  
  constructor() {
    super();
    this.config = {
      enableDevTools: environment.features.devTools,
      enablePersistence: environment.features.persistence,
      persistenceKey: 'auth-store',
      enableHistory: environment.features.devTools,
      maxHistorySize: 10
    };
    this.initialize();
    this.checkPersistedAuth();
  }
  
  // Check if we have persisted tokens on app startup
  private checkPersistedAuth(): void {
    const token = this.accessToken();
    if (token) {
      // Validate token by attempting to decode it (basic check)
      if (this.isTokenExpired(token)) {
        this.attemptTokenRefresh();
      } else {
        this.setState(state => ({
          ...state,
          isAuthenticated: true
        }), 'RESTORE_SESSION');
      }
    }
  }
  
  // Check if JWT token is expired
  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch {
      return true;
    }
  }
  
  // Extract user info from JWT token
  private getUserFromToken(token: string): User | null {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        username: payload.username || payload.sub,
        email: payload.email
      };
    } catch {
      return null;
    }
  }
  
  // Actions
  login(credentials: LoginCredentials): Promise<boolean> {
    return new Promise((resolve) => {
      this.setLoading(true, 'LOGIN');
      this.clearError();
      
      this.http.post<TokenResponse>(this.loginUrl, credentials)
        .pipe(
          catchError((error: HttpErrorResponse) => {
            const errorMessage = error.error?.detail || 
                               error.error?.message || 
                               'Login failed. Please check your credentials.';
            
            this.setState(state => ({
              ...state,
              isLoading: false,
              error: errorMessage
            }), 'LOGIN_FAILURE');
            
            if (environment.features.logging) {
              console.error('Login failed:', error);
            }
            
            resolve(false);
            return throwError(() => error);
          })
        )
        .subscribe({
          next: (response) => {
            const user = this.getUserFromToken(response.access);
            
            if (user) {
              this.setState(state => ({
                ...state,
                isAuthenticated: true,
                currentUser: user,
                accessToken: response.access,
                refreshToken: response.refresh,
                isLoading: false,
                error: null
              }), 'LOGIN_SUCCESS');
              
              if (environment.features.logging) {
                console.log('Login successful for user:', user.username);
              }
              
              resolve(true);
            } else {
              this.setState(state => ({
                ...state,
                isLoading: false,
                error: 'Invalid token received from server'
              }), 'LOGIN_FAILURE');
              
              resolve(false);
            }
          },
          error: () => {
            // Error already handled in catchError
          }
        });
    });
  }
  
  logout(): void {
    this.setState(state => ({
      ...state,
      isAuthenticated: false,
      currentUser: null,
      accessToken: null,
      refreshToken: null,
      error: null
    }), 'LOGOUT');
    
    if (environment.features.logging) {
      console.log('User logged out');
    }
    
    this.router.navigate(['/login']);
  }
  
  // Refresh access token using refresh token
  refreshAccessToken(): Promise<boolean> {
    return new Promise((resolve) => {
      const currentRefreshToken = this.refreshToken();
      
      if (!currentRefreshToken) {
        this.logout();
        resolve(false);
        return;
      }
      
      this.setLoading(true, 'REFRESH_TOKEN');
      
      this.http.post<TokenResponse>(this.refreshUrl, { 
        refresh: currentRefreshToken 
      })
        .pipe(
          catchError((error: HttpErrorResponse) => {
            if (environment.features.logging) {
              console.warn('Token refresh failed:', error);
            }
            this.logout();
            resolve(false);
            return throwError(() => error);
          })
        )
        .subscribe({
          next: (response) => {
            const user = this.getUserFromToken(response.access);
            
            this.setState(state => ({
              ...state,
              accessToken: response.access,
              refreshToken: response.refresh,
              currentUser: user || state.currentUser,
              isLoading: false,
              error: null
            }), 'REFRESH_TOKEN_SUCCESS');
            
            if (environment.features.logging) {
              console.log('Token refreshed successfully');
            }
            
            resolve(true);
          },
          error: () => {
            // Error already handled in catchError
          }
        });
    });
  }
  
  // Attempt token refresh (used internally)
  private attemptTokenRefresh(): void {
    this.refreshAccessToken().then(success => {
      if (!success && environment.features.logging) {
        console.warn('Unable to refresh token, logging out');
      }
    });
  }
  
  updateUser(user: Partial<User>): void {
    const currentUser = this.currentUser();
    if (currentUser) {
      this.setState(state => ({
        ...state,
        currentUser: { ...currentUser, ...user }
      }), 'UPDATE_USER');
    }
  }
  
  clearAuthError(): void {
    this.clearError();
  }
  
  // Check if user has specific permission (extensible for future use)
  hasPermission(_permission: string): boolean {
    const user = this.currentUser();
    return this.isAuthenticated() && user !== null && this.hasValidToken();
  }
  
  // Session management
  refreshSession(): Promise<boolean> {
    const token = this.accessToken();
    
    if (!token) {
      this.logout();
      return Promise.resolve(false);
    }
    
    if (this.isTokenExpired(token)) {
      return this.refreshAccessToken();
    }
    
    return Promise.resolve(true);
  }
  
  // Public reset method
  reset(): void {
    this.resetState('RESET_AUTH_STORE');
  }
}