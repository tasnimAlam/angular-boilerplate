import { Injectable, inject, signal, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

export interface User {
  username: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  
  private readonly _isAuthenticated = signal(false);
  private readonly _currentUser = signal<User | null>(null);
  
  readonly isAuthenticated = this._isAuthenticated.asReadonly();
  readonly currentUser = this._currentUser.asReadonly();
  
  constructor() {
    this.checkStoredAuth();
  }
  
  login(username: string, password: string): boolean {
    if (username === 'test' && password === 'test') {
      const user: User = { username };
      this._currentUser.set(user);
      this._isAuthenticated.set(true);
      
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem('auth_user', JSON.stringify(user));
      }
      return true;
    }
    return false;
  }
  
  logout(): void {
    this._currentUser.set(null);
    this._isAuthenticated.set(false);
    
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('auth_user');
    }
    this.router.navigate(['/login']);
  }
  
  private checkStoredAuth(): void {
    if (isPlatformBrowser(this.platformId)) {
      const storedUser = localStorage.getItem('auth_user');
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          this._currentUser.set(user);
          this._isAuthenticated.set(true);
        } catch {
          localStorage.removeItem('auth_user');
        }
      }
    }
  }
}