import { Injectable, computed } from '@angular/core';
import { BaseStore } from '../base/base.store';
import { UIState, Notification } from '../base/store.interfaces';

@Injectable({
  providedIn: 'root'
})
export class UIStore extends BaseStore<UIState> {
  
  // Public selectors
  readonly theme = this.createSelector(state => state.theme);
  readonly sidebarOpen = this.createSelector(state => state.sidebarOpen);
  readonly notifications = this.createSelector(state => state.notifications);
  readonly isOffline = this.createSelector(state => state.isOffline);
  readonly loading = this.createSelector(state => state.loading);
  
  // Computed selectors
  readonly hasNotifications = computed(() => this.notifications().length > 0);
  readonly unreadNotifications = computed(() => 
    this.notifications().filter(n => !n.duration || Date.now() - n.timestamp < n.duration)
  );
  readonly isLoading = computed(() => 
    Object.values(this.loading()).some(loading => loading)
  );
  
  protected get initialState(): UIState {
    return {
      theme: 'light',
      sidebarOpen: false,
      notifications: [],
      isOffline: false,
      loading: {}
    };
  }
  
  protected get storeName(): string {
    return 'UI';
  }
  
  constructor() {
    super();
    this.config = {
      enableDevTools: true,
      enablePersistence: true,
      persistenceKey: 'ui-store',
      enableHistory: false, // UI state doesn't need history
      maxHistorySize: 0
    };
    this.initialize();
    this.setupOnlineOfflineDetection();
  }
  
  // Theme actions
  setTheme(theme: 'light' | 'dark' | 'auto'): void {
    this.patchState({ theme }, 'SET_THEME');
  }
  
  toggleTheme(): void {
    const currentTheme = this.theme();
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }
  
  // Sidebar actions
  toggleSidebar(): void {
    this.patchState({ 
      sidebarOpen: !this.sidebarOpen() 
    }, 'TOGGLE_SIDEBAR');
  }
  
  setSidebarOpen(open: boolean): void {
    this.patchState({ sidebarOpen: open }, 'SET_SIDEBAR_OPEN');
  }
  
  // Notification actions
  addNotification(notification: Omit<Notification, 'id' | 'timestamp'>): string {
    const id = this.generateNotificationId();
    const newNotification: Notification = {
      ...notification,
      id,
      timestamp: Date.now(),
      duration: notification.duration || 5000 // Default 5 seconds
    };
    
    this.setState(state => ({
      ...state,
      notifications: [...state.notifications, newNotification]
    }), 'ADD_NOTIFICATION');
    
    // Auto-remove notification after duration
    if (newNotification.duration) {
      setTimeout(() => {
        this.removeNotification(id);
      }, newNotification.duration);
    }
    
    return id;
  }
  
  removeNotification(id: string): void {
    this.setState(state => ({
      ...state,
      notifications: state.notifications.filter(n => n.id !== id)
    }), 'REMOVE_NOTIFICATION');
  }
  
  clearAllNotifications(): void {
    this.patchState({ notifications: [] }, 'CLEAR_ALL_NOTIFICATIONS');
  }
  
  // Loading state actions
  setLoadingState(key: string, loading: boolean): void {
    this.setState(state => ({
      ...state,
      loading: {
        ...state.loading,
        [key]: loading
      }
    }), `SET_LOADING_${key.toUpperCase()}`);
  }
  
  clearLoadingState(key: string): void {
    this.setState(state => {
      const { [key]: removed, ...remainingLoading } = state.loading;
      return {
        ...state,
        loading: remainingLoading
      };
    }, `CLEAR_LOADING_${key.toUpperCase()}`);
  }
  
  // Utility notification methods
  showSuccess(title: string, message: string, duration?: number): string {
    return this.addNotification({ type: 'success', title, message, duration });
  }
  
  showError(title: string, message: string, duration?: number): string {
    return this.addNotification({ type: 'error', title, message, duration: duration || 8000 });
  }
  
  showWarning(title: string, message: string, duration?: number): string {
    return this.addNotification({ type: 'warning', title, message, duration });
  }
  
  showInfo(title: string, message: string, duration?: number): string {
    return this.addNotification({ type: 'info', title, message, duration });
  }
  
  // Private methods
  private generateNotificationId(): string {
    return `notification_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }
  
  private setupOnlineOfflineDetection(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.patchState({ isOffline: false }, 'NETWORK_ONLINE');
      });
      
      window.addEventListener('offline', () => {
        this.patchState({ isOffline: true }, 'NETWORK_OFFLINE');
        this.showWarning('Network', 'You are currently offline');
      });
      
      // Initial state
      this.patchState({ isOffline: !navigator.onLine }, 'INITIAL_NETWORK_STATE');
    }
  }
  
  // Public reset method
  reset(): void {
    this.resetState('RESET_UI_STORE');
  }
}