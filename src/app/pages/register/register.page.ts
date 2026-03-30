import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { addIcons } from 'ionicons';
import { AuthService } from 'src/app/services/auth';
import { RouterLink } from '@angular/router';
import { IonButton, IonInput, IonIcon } from '@ionic/angular/standalone';
import { logoGoogle, mailOutline, lockClosedOutline, personOutline } from 'ionicons/icons';

@Component({
  selector: 'app-register',
  template: `
    <div class="auth-page">

      <div class="auth-hero">
        <div class="auth-logo">Qahoot</div>
        <p class="auth-tagline">Join the game</p>
      </div>

      <div class="auth-card">
        <h2 class="auth-title">Create Account</h2>

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">

          <div class="auth-field">
            <ion-icon name="mail-outline"></ion-icon>
            <ion-input
              formControlName="email"
              type="email"
              placeholder="Email"
              class="auth-input"
            ></ion-input>
          </div>
          <p class="auth-error" *ngIf="registerForm.get('email')?.invalid && registerForm.get('email')?.touched">
            {{ invalidEmailText }}
          </p>

          <div class="auth-field">
            <ion-icon name="person-outline"></ion-icon>
            <ion-input
              formControlName="alias"
              type="text"
              placeholder="Alias (your display name)"
              class="auth-input"
            ></ion-input>
          </div>
          <p class="auth-error" *ngIf="registerForm.get('alias')?.invalid && registerForm.get('alias')?.touched">
            {{ invalidAliasText }}
          </p>

          <div class="auth-field">
            <ion-icon name="lock-closed-outline"></ion-icon>
            <ion-input
              formControlName="password"
              type="password"
              placeholder="Password (min. 6 characters)"
              class="auth-input"
            ></ion-input>
          </div>
          <p class="auth-error" *ngIf="registerForm.get('password')?.invalid && registerForm.get('password')?.touched">
            {{ invalidPasswordText }}
          </p>

          <div class="auth-field">
            <ion-icon name="lock-closed-outline"></ion-icon>
            <ion-input
              formControlName="passwordConfirm"
              type="password"
              placeholder="Confirm Password"
              class="auth-input"
            ></ion-input>
          </div>
          <p class="auth-error" *ngIf="registerForm.get('passwordConfirm')?.invalid && registerForm.get('passwordConfirm')?.touched">
            {{ invalidPasswordConfirmText }}
          </p>

          <ion-button
            expand="block"
            type="submit"
            class="auth-btn-primary"
            [disabled]="registerForm.invalid"
          >
            Create Account
          </ion-button>

        </form>

        <div class="auth-divider"><span>or</span></div>

        <ion-button
          expand="block"
          fill="outline"
          class="auth-btn-google"
          (click)="registerWithGoogle()"
        >
          <ion-icon name="logo-google" slot="start"></ion-icon>
          Continue with Google
        </ion-button>

        <p class="auth-switch">
          Already have an account?
          <a routerLink="/login">Login here</a>
        </p>
      </div>

    </div>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      background: linear-gradient(135deg, #46178f 0%, #2d0f5e 100%);
    }

    .auth-page {
      min-height: 100vh;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      padding: 32px 20px;
      font-family: 'Nunito', sans-serif;
    }

    .auth-hero { text-align: center; margin-bottom: 32px; }
    .auth-logo {
      font-size: 3rem; font-weight: 900; color: #ffcc00;
      text-shadow: 0 6px 0 rgba(0,0,0,0.3); letter-spacing: -1px;
    }
    .auth-tagline {
      color: rgba(255,255,255,0.6); font-weight: 700;
      font-size: 0.95rem; margin: 4px 0 0;
    }

    .auth-card {
      width: 100%; max-width: 420px;
      background: rgba(255,255,255,0.07);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 24px; padding: 32px 28px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.3);
    }

    .auth-title {
      color: white; font-size: 1.4rem; font-weight: 900;
      margin: 0 0 24px; text-align: center;
    }

    .auth-field {
      display: flex; align-items: center; gap: 12px;
      background: rgba(255,255,255,0.1);
      border: 1px solid rgba(255,255,255,0.15);
      border-radius: 12px; padding: 4px 16px;
      margin-bottom: 6px;
      transition: border-color 0.2s;
    }
    .auth-field:focus-within { border-color: #ffcc00; }
    .auth-field ion-icon {
      color: rgba(255,255,255,0.5); font-size: 1.1rem; flex-shrink: 0;
    }
    .auth-input {
      --color: white;
      --placeholder-color: rgba(255,255,255,0.4);
      --background: transparent;
      --padding-start: 0;
      flex: 1;
    }

    .auth-error {
      color: #f08080; font-size: 0.75rem;
      font-weight: 700; margin: 0 4px 10px;
    }

    .auth-btn-primary {
      --background: #ffcc00;
      --background-activated: #e6b800;
      --color: #111;
      --border-radius: 12px;
      --box-shadow: 0 5px 0 #e6b800;
      font-weight: 900; font-size: 1rem;
      margin-top: 8px;
    }

    .auth-divider {
      display: flex; align-items: center; gap: 12px;
      margin: 20px 0;
    }
    .auth-divider::before,
    .auth-divider::after {
      content: ''; flex: 1; height: 1px;
      background: rgba(255,255,255,0.15);
    }
    .auth-divider span {
      color: rgba(255,255,255,0.4); font-size: 0.8rem; font-weight: 700;
    }

    .auth-btn-google {
      --border-color: rgba(255,255,255,0.25);
      --color: white;
      --border-radius: 12px;
      font-weight: 700;
    }

    .auth-switch {
      text-align: center; color: rgba(255,255,255,0.5);
      font-size: 0.85rem; margin: 20px 0 0;
    }
    .auth-switch a {
      color: #ffcc00; font-weight: 700; text-decoration: none;
    }
  `],
  imports: [
    IonButton, IonInput, IonIcon,
    CommonModule, ReactiveFormsModule, RouterLink,
  ],
})
export class RegisterPage {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  invalidEmailText = 'Not a valid email';
  invalidAliasText = 'Alias is required';
  invalidPasswordText = 'Password should have at least 6 characters';
  invalidPasswordConfirmText = 'Does not match password';

  registerForm = this.fb.group({
    email: ['', [Validators.email, Validators.required]],
    alias: ['', [Validators.required]],
    password: ['', Validators.minLength(6)],
    passwordConfirm: ['', passwordConfirmMatchPasswordValidator()],
  });

  constructor() {
    addIcons({ logoGoogle, mailOutline, lockClosedOutline, personOutline });
  }

  onSubmit() {
    const { email, password, alias } = this.registerForm.value;
    this.authService.register(email!, password!, alias!);
  }

  registerWithGoogle() {
    this.authService.signInWithGoogle();
  }
}

export function passwordConfirmMatchPasswordValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const controls = control.parent?.controls as {
      [key: string]: AbstractControl | null;
    };
    const password = controls ? controls['password']?.value : null;
    const passwordConfirm = control?.value;
    return passwordConfirm === password ? null : { passwordConfirmMissmatch: true };
  };
}