import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { MATERIAL_IMPORTS } from '../../shared/material/material.imports';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, ...MATERIAL_IMPORTS],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  
  protected readonly loginForm: FormGroup;
  protected readonly errorMessage = signal('');
  protected readonly isLoading = signal(false);
  
  constructor() {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }
  
  protected onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading.set(true);
      this.errorMessage.set('');
      
      const { username, password } = this.loginForm.value;
      
      // Simulate async login
      setTimeout(() => {
        const success = this.authService.login(username, password);
        
        if (success) {
          this.router.navigate(['/dashboard']);
        } else {
          this.errorMessage.set('Invalid username or password');
        }
        
        this.isLoading.set(false);
      }, 500);
    }
  }
}