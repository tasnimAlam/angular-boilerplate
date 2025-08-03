import { Injectable, inject, computed } from '@angular/core';
import { Router } from '@angular/router';
import { BaseStore } from '../base/base.store';
import { AuthState, User } from '../base/store.interfaces';

export interface LoginCredentials {
  username: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthStore extends BaseStore<AuthState> {
  private readonly router = inject(Router);
  
  // Public selectors
  readonly isAuthenticated = this.createSelector(state => state.isAuthenticated);
  readonly currentUser = this.createSelector(state => state.currentUser);
  readonly isLoading = this.createSelector(state => state.isLoading);
  readonly error = this.createSelector(state => state.error);
  
  // Computed selectors
  readonly userName = computed(() => this.currentUser()?.username || '');
  readonly isLoggedIn = computed(() => this.isAuthenticated() && this.currentUser() !== null);
  
  protected get initialState(): AuthState {
    return {
      isAuthenticated: false,
      currentUser: null,
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
      enableDevTools: true,
      enablePersistence: true,
      persistenceKey: 'auth-store',
      enableHistory: true,
      maxHistorySize: 10
    };
    this.initialize();
  }
  
  // Actions
  login(credentials: LoginCredentials): Promise<boolean> {
    return new Promise((resolve) => {
      this.setLoading(true, 'LOGIN');
      this.clearError();
      
      // Simulate async login
      setTimeout(() => {
        if (credentials.username === 'test' && credentials.password === 'test') {
          const user: User = { 
            username: credentials.username,
            email: `${credentials.username}@example.com`
          };
          
          this.setState(state => ({
            ...state,
            isAuthenticated: true,
            currentUser: user,
            isLoading: false,
            error: null
          }), 'LOGIN_SUCCESS');
          
          resolve(true);
        } else {
          this.setState(state => ({
            ...state,
            isLoading: false,
            error: 'Invalid username or password'
          }), 'LOGIN_FAILURE');
          
          resolve(false);
        }
      }, 500);
    });
  }
  
  logout(): void {
    this.setState(state => ({
      ...state,
      isAuthenticated: false,
      currentUser: null,
      error: null
    }), 'LOGOUT');
    
    this.router.navigate(['/login']);
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
    // For now, authenticated users have all permissions
    return this.isAuthenticated() && user !== null;
  }
  
  // Session management
  refreshSession(): Promise<boolean> {
    return new Promise((resolve) => {
      this.setLoading(true, 'REFRESH_SESSION');
      
      // Simulate session refresh
      setTimeout(() => {
        const currentUser = this.currentUser();
        if (currentUser) {
          this.setState(state => ({
            ...state,
            isLoading: false,
            error: null
          }), 'REFRESH_SESSION_SUCCESS');
          resolve(true);
        } else {
          this.logout();
          resolve(false);
        }
      }, 1000);
    });
  }
  
  // Public reset method
  reset(): void {
    this.resetState('RESET_AUTH_STORE');
  }
}