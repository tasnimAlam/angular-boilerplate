// Store action types
export type StoreAction<T = any> = {
  type: string;
  payload?: T;
  meta?: {
    timestamp: number;
    source?: string;
  };
};

// Async operation states
export interface AsyncOperation<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: number | null;
}

// Store configuration
export interface StoreConfig {
  enableDevTools: boolean;
  enablePersistence: boolean;
  persistenceKey: string;
  enableHistory: boolean;
  maxHistorySize: number;
}

// Persistence configuration
export interface PersistenceConfig {
  storage: 'localStorage' | 'sessionStorage' | 'indexedDB';
  key: string;
  paths?: string[];
  serialize?: (state: any) => string;
  deserialize?: (data: string) => any;
}

// Store update function type
export type StateUpdater<T> = (state: T) => T;

// Store selector function type
export type StateSelector<T, R> = (state: T) => R;