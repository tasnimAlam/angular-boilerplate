import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { MATERIAL_IMPORTS } from '../../shared/material/material.imports';

@Component({
  selector: 'app-dashboard',
  imports: [...MATERIAL_IMPORTS],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  private readonly authService = inject(AuthService);
  
  protected onLogout(): void {
    this.authService.logout();
  }
}