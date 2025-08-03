import { Injectable, inject } from '@angular/core';
import { AppStore } from './app.store';

declare global {
  interface Window {
    __ANGULAR_STORES__: any;
  }
}

@Injectable({
  providedIn: 'root'
})
export class StoreDevTools {
  private readonly appStore = inject(AppStore);
  
  constructor() {
    this.setupDevTools();
  }
  
  private setupDevTools(): void {
    if (typeof window === 'undefined') return;
    
    // Expose stores to global window for debugging
    window.__ANGULAR_STORES__ = {
      app: this.appStore,
      auth: this.appStore.auth,
      ui: this.appStore.ui,
      
      // Utility methods
      getGlobalState: () => this.appStore.state(),
      getSnapshot: () => this.appStore.getGlobalSnapshot(),
      loadSnapshot: (snapshot: any) => this.appStore.loadGlobalSnapshot(snapshot),
      resetAll: () => this.appStore.resetAllStores(),
      
      // Individual store access
      stores: {
        auth: {
          state: () => this.appStore.auth.state(),
          snapshot: () => this.appStore.auth.getSnapshot(),
          reset: () => this.appStore.auth.reset()
        },
        ui: {
          state: () => this.appStore.ui.state(),
          snapshot: () => this.appStore.ui.getSnapshot(),
          reset: () => this.appStore.ui.reset(),
          showNotification: (type: string, title: string, message: string) => {
            switch (type) {
              case 'success':
                return this.appStore.ui.showSuccess(title, message);
              case 'error':
                return this.appStore.ui.showError(title, message);
              case 'warning':
                return this.appStore.ui.showWarning(title, message);
              case 'info':
                return this.appStore.ui.showInfo(title, message);
              default:
                return this.appStore.ui.showInfo(title, message);
            }
          }
        }
      }
    };
    
    // Log available DevTools commands
    console.log(`
🏪 Angular Stores DevTools Available!

Access stores via: window.__ANGULAR_STORES__

Available commands:
- __ANGULAR_STORES__.getGlobalState() - Get current app state
- __ANGULAR_STORES__.getSnapshot() - Get state snapshot with history
- __ANGULAR_STORES__.loadSnapshot(snapshot) - Load state from snapshot
- __ANGULAR_STORES__.resetAll() - Reset all stores to initial state

Individual stores:
- __ANGULAR_STORES__.stores.auth.state() - Get auth state
- __ANGULAR_STORES__.stores.ui.state() - Get UI state
- __ANGULAR_STORES__.stores.ui.showNotification(type, title, message) - Show notification

Examples:
__ANGULAR_STORES__.stores.ui.showNotification('success', 'Test', 'This is a test notification')
__ANGULAR_STORES__.stores.auth.reset()
    `);
  }
}