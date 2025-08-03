import { Component, inject, computed } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthStore } from '../../core/store/auth/auth.store';
import { MATERIAL_IMPORTS } from '../../shared/material/material.imports';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, ...MATERIAL_IMPORTS],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);
  
  protected readonly loginForm: FormGroup;
  protected readonly isLoading = computed(() => this.authStore.isLoading());
  protected readonly errorMessage = computed(() => this.authStore.error() || '');
  
  constructor() {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }
  
  protected async onSubmit(): Promise<void> {
    if (this.loginForm.valid) {
      this.authStore.clearAuthError();
      
      const { username, password } = this.loginForm.value;
      
      const success = await this.authStore.login({ username, password });
      
      if (success) {
        this.router.navigate(['/dashboard']);
      }
    }
  }
}