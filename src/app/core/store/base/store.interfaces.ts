export interface User {
  username: string;
  email?: string;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  notifications: boolean;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: number;
  duration?: number;
}

export interface Activity {
  id: string;
  type: string;
  description: string;
  timestamp: number;
}

// Auth State
export interface AuthState {
  isAuthenticated: boolean;
  currentUser: User | null;
  isLoading: boolean;
  error: string | null;
}

// UI State
export interface UIState {
  theme: 'light' | 'dark' | 'auto';
  sidebarOpen: boolean;
  notifications: Notification[];
  isOffline: boolean;
  loading: Record<string, boolean>;
}

// App State (Root)
export interface AppState {
  auth: AuthState;
  ui: UIState;
}