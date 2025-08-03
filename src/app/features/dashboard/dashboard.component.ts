import { Component, inject } from '@angular/core';
import { AuthStore } from '../../core/store/auth/auth.store';
import { MATERIAL_IMPORTS } from '../../shared/material/material.imports';

@Component({
  selector: 'app-dashboard',
  imports: [...MATERIAL_IMPORTS],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  private readonly authStore = inject(AuthStore);
  
  protected readonly userName = this.authStore.userName;
  
  protected onLogout(): void {
    this.authStore.logout();
  }
}