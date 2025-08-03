import { Injectable, PLATFORM_ID, inject, signal, computed, effect } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { StateUpdater, StoreAction, StoreConfig } from './store.types';

@Injectable()
export abstract class BaseStore<T extends Record<string, any>> {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly _state = signal<T>(this.getInitialState());
  private readonly _history = signal<T[]>([]);
  private readonly _actions = signal<StoreAction[]>([]);
  
  // Public readonly signals
  readonly state = this._state.asReadonly();
  readonly history = this._history.asReadonly();
  readonly actions = this._actions.asReadonly();
  
  // Computed selectors
  readonly canUndo = computed(() => this._history().length > 1);
  readonly canRedo = computed(() => false); // Will implement with redo stack
  
  protected config: StoreConfig = {
    enableDevTools: false,
    enablePersistence: false,
    persistenceKey: '',
    enableHistory: true,
    maxHistorySize: 50
  };
  
  constructor() {
    this.setupEffects();
    this.loadPersistedState();
  }
  
  // Abstract methods to be implemented by derived stores
  protected abstract get initialState(): T;
  protected abstract get storeName(): string;
  
  // Helper method to get initial state (solves constructor access issue)
  private getInitialState(): T {
    return {} as T; // Temporary, will be set in derived classes
  }
  
  // Initialize method to be called by derived classes
  protected initialize(): void {
    this._state.set(this.initialState);
  }
  
  // State update methods
  protected setState(updater: StateUpdater<T>, action?: string): void {
    const previousState = this._state();
    const newState = updater(previousState);
    
    this._state.set(newState);
    this.addToHistory(previousState);
    this.logAction(action || 'SET_STATE', newState);
  }
  
  protected patchState(partial: Partial<T>, action?: string): void {
    this.setState(
      (state) => ({ ...state, ...partial }),
      action || 'PATCH_STATE'
    );
  }
  
  protected resetState(action?: string): void {
    this.setState(
      () => this.initialState,
      action || 'RESET_STATE'
    );
  }
  
  // Async operation helpers
  protected setLoading(isLoading: boolean, operation?: string): void {
    const currentState = this._state();
    if ('isLoading' in currentState) {
      this.patchState(
        { isLoading } as unknown as Partial<T>,
        operation ? `SET_LOADING_${operation}` : 'SET_LOADING'
      );
    }
  }
  
  protected setError(error: string | null, action?: string): void {
    const currentState = this._state();
    if ('error' in currentState) {
      this.patchState(
        { error } as unknown as Partial<T>,
        action || 'SET_ERROR'
      );
    }
  }
  
  protected clearError(): void {
    this.setError(null, 'CLEAR_ERROR');
  }
  
  // History management
  private addToHistory(state: T): void {
    if (!this.config.enableHistory) return;
    
    const history = this._history();
    const newHistory = [state, ...history].slice(0, this.config.maxHistorySize);
    this._history.set(newHistory);
  }
  
  protected undo(): void {
    const history = this._history();
    if (history.length > 0) {
      const [previousState, ...remainingHistory] = history;
      this._state.set(previousState);
      this._history.set(remainingHistory);
      this.logAction('UNDO');
    }
  }
  
  // Action logging
  private logAction(type: string, payload?: any): void {
    const action: StoreAction = {
      type: `${this.storeName}/${type}`,
      payload,
      meta: {
        timestamp: Date.now(),
        source: this.storeName
      }
    };
    
    const actions = this._actions();
    this._actions.set([action, ...actions].slice(0, 100)); // Keep last 100 actions
    
    if (this.config.enableDevTools && isPlatformBrowser(this.platformId)) {
      console.log(`🏪 ${action.type}`, {
        payload: action.payload,
        state: this._state(),
        timestamp: new Date(action.meta!.timestamp).toISOString()
      });
    }
  }
  
  // Persistence
  private setupEffects(): void {
    if (this.config.enablePersistence && isPlatformBrowser(this.platformId)) {
      effect(() => {
        const state = this._state();
        this.persistState(state);
      });
    }
  }
  
  private loadPersistedState(): void {
    if (!this.config.enablePersistence || !isPlatformBrowser(this.platformId)) {
      return;
    }
    
    try {
      const persistedData = localStorage.getItem(this.config.persistenceKey);
      if (persistedData) {
        const parsedState = JSON.parse(persistedData);
        this._state.set({ ...this.initialState, ...parsedState });
        this.logAction('LOAD_PERSISTED_STATE');
      }
    } catch (error) {
      console.error(`Failed to load persisted state for ${this.storeName}:`, error);
      this.logAction('LOAD_PERSISTED_STATE_ERROR', error);
    }
  }
  
  private persistState(state: T): void {
    if (!isPlatformBrowser(this.platformId)) return;
    
    try {
      localStorage.setItem(this.config.persistenceKey, JSON.stringify(state));
    } catch (error) {
      console.error(`Failed to persist state for ${this.storeName}:`, error);
    }
  }
  
  // Utility methods
  protected createSelector<R>(selector: (state: T) => R) {
    return computed(() => selector(this._state()));
  }
  
  // Dev tools integration
  getSnapshot(): { state: T; history: T[]; actions: StoreAction[] } {
    return {
      state: this._state(),
      history: this._history(),
      actions: this._actions()
    };
  }
  
  loadSnapshot(snapshot: { state: T }): void {
    this._state.set(snapshot.state);
    this.logAction('LOAD_SNAPSHOT');
  }
}