import { Injectable, inject, computed, effect } from '@angular/core';
import { AuthStore } from './auth/auth.store';
import { UIStore } from './ui/ui.store';
import { AppState } from './base/store.interfaces';

@Injectable({
  providedIn: 'root'
})
export class AppStore {
  private readonly authStore = inject(AuthStore);
  private readonly uiStore = inject(UIStore);
  
  // Expose individual stores
  readonly auth = this.authStore;
  readonly ui = this.uiStore;
  
  // Computed app state
  readonly state = computed((): AppState => ({
    auth: this.authStore.state(),
    ui: this.uiStore.state()
  }));
  
  // Global computed selectors
  readonly isAuthenticated = computed(() => this.authStore.isAuthenticated());
  readonly currentUser = computed(() => this.authStore.currentUser());
  readonly isLoading = computed(() => 
    this.authStore.isLoading() || this.uiStore.isLoading()
  );
  readonly hasNotifications = computed(() => this.uiStore.hasNotifications());
  readonly theme = computed(() => this.uiStore.theme());
  
  constructor() {
    this.setupGlobalEffects();
  }
  
  // Global actions
  showNotificationForAuthError(): void {
    const authError = this.authStore.error();
    if (authError) {
      this.uiStore.showError('Authentication Error', authError);
      this.authStore.clearAuthError();
    }
  }
  
  // Dev tools methods
  getGlobalSnapshot() {
    return {
      auth: this.authStore.getSnapshot(),
      ui: this.uiStore.getSnapshot(),
      timestamp: Date.now()
    };
  }
  
  loadGlobalSnapshot(snapshot: any): void {
    if (snapshot.auth) {
      this.authStore.loadSnapshot(snapshot.auth);
    }
    if (snapshot.ui) {
      this.uiStore.loadSnapshot(snapshot.ui);
    }
  }
  
  resetAllStores(): void {
    this.authStore.reset();
    this.uiStore.reset();
  }
  
  // Global effects
  private setupGlobalEffects(): void {
    // Show notification when auth error occurs
    effect(() => {
      const authError = this.authStore.error();
      if (authError) {
        this.uiStore.showError('Authentication Failed', authError);
      }
    });
    
    // Show success notification on login
    effect(() => {
      const isAuthenticated = this.authStore.isAuthenticated();
      const currentUser = this.authStore.currentUser();
      
      if (isAuthenticated && currentUser) {
        this.uiStore.showSuccess(
          'Welcome!', 
          `Hello ${currentUser.username}, you have successfully logged in.`
        );
      }
    });
    
    // Log global state changes in development
    if (typeof window !== 'undefined' && !window.location.hostname.includes('localhost')) {
      return; // Only in development
    }
    
    effect(() => {
      const state = this.state();
      console.log('🌐 Global State Update:', {
        timestamp: new Date().toISOString(),
        state: state
      });
    });
  }
}