import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EnvironmentService {
  get production(): boolean {
    return environment.production;
  }
  
  get apiUrl(): string {
    return environment.apiUrl;
  }
  
  get apiEndpoints() {
    return environment.apiEndpoints;
  }
  
  get app() {
    return environment.app;
  }
  
  get features() {
    return environment.features;
  }
  
  getApiUrl(endpoint: string): string {
    return `${this.apiUrl}${endpoint}`;
  }
  
  isFeatureEnabled(feature: keyof typeof environment.features): boolean {
    return environment.features[feature];
  }
}