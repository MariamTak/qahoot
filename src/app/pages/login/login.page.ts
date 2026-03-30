import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  IonButton,
  IonContent,
  IonInput,
  IonIcon,
} from '@ionic/angular/standalone';
import { RouterLink } from '@angular/router';
import { addIcons } from 'ionicons';
import { AuthService } from '../../services/auth';
import { logoGoogle, lockClosedOutline, mailOutline } from 'ionicons/icons';
addIcons({ logoGoogle, lockClosedOutline, mailOutline });

@Component({
  selector: 'app-login',
  template: `
    <div class="auth-page">

      <!-- Logo -->
      <div class="auth-hero">
        <div class="auth-logo">Qahoot</div>
        <p class="auth-tagline">Play. Learn. Win.</p>
      </div>

      <!-- Card -->
      <div class="auth-card">
        <h2 class="auth-title">Welcome back!</h2>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">

          <div class="auth-field">
            <ion-icon name="mail-outline"></ion-icon>
            <ion-input
              formControlName="email"
              type="email"
              placeholder="Email"
              class="auth-input"
            ></ion-input>
          </div>

          <div class="auth-field">
            <ion-icon name="lock-closed-outline"></ion-icon>
            <ion-input
              formControlName="password"
              type="password"
              placeholder="Password"
              class="auth-input"
            ></ion-input>
          </div>

          <p class="auth-forgot">
            Forgot your password?
            <a routerLink="/password-retrieve">Retrieve it here</a>
          </p>

          <ion-button expand="block" type="submit" class="auth-btn-primary">
            Login
          </ion-button>

        </form>

        <div class="auth-divider">
          <span>or</span>
        </div>

        <ion-button
          expand="block"
          fill="outline"
          class="auth-btn-google"
          (click)="loginWithGoogle()"
        >
          <ion-icon name="logo-google" slot="start"></ion-icon>
          Continue with Google
        </ion-button>

        <p class="auth-switch">
          No account yet?
          <a routerLink="/register">Register here</a>
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
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 32px 20px;
      font-family: 'Nunito', sans-serif;
    }

    /* Hero */
    .auth-hero {
      text-align: center;
      margin-bottom: 32px;
    }
    .auth-logo {
      font-size: 3rem;
      font-weight: 900;
      color: #ffcc00;
      text-shadow: 0 6px 0 rgba(0,0,0,0.3);
      letter-spacing: -1px;
    }
    .auth-tagline {
      color: rgba(255,255,255,0.6);
      font-weight: 700;
      font-size: 0.95rem;
      margin: 4px 0 0;
    }

    /* Card */
    .auth-card {
      width: 100%;
      max-width: 420px;
      background: rgba(255,255,255,0.07);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 24px;
      padding: 32px 28px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.3);
    }
    .auth-title {
      color: white;
      font-size: 1.4rem;
      font-weight: 900;
      margin: 0 0 24px;
      text-align: center;
    }

    /* Fields */
    .auth-field {
      display: flex;
      align-items: center;
      gap: 12px;
      background: rgba(255,255,255,0.1);
      border: 1px solid rgba(255,255,255,0.15);
      border-radius: 12px;
      padding: 4px 16px;
      margin-bottom: 14px;
      transition: border-color 0.2s;
    }
    .auth-field:focus-within {
      border-color: #ffcc00;
    }
    .auth-field ion-icon {
      color: rgba(255,255,255,0.5);
      font-size: 1.1rem;
      flex-shrink: 0;
    }
    .auth-input {
      --color: white;
      --placeholder-color: rgba(255,255,255,0.4);
      --background: transparent;
      --padding-start: 0;
      flex: 1;
    }

    /* Forgot */
    .auth-forgot {
      text-align: right;
      font-size: 0.8rem;
      color: rgba(255,255,255,0.5);
      margin: 0 0 20px;
    }
    .auth-forgot a {
      color: #ffcc00;
      text-decoration: none;
      font-weight: 700;
    }

    /* Primary button */
    .auth-btn-primary {
      --background: #ffcc00;
      --background-activated: #e6b800;
      --color: #111;
      --border-radius: 12px;
      --box-shadow: 0 5px 0 #e6b800;
      font-weight: 900;
      font-size: 1rem;
      margin-bottom: 0;
    }

    /* Divider */
    .auth-divider {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 20px 0;
    }
    .auth-divider::before,
    .auth-divider::after {
      content: '';
      flex: 1;
      height: 1px;
      background: rgba(255,255,255,0.15);
    }
    .auth-divider span {
      color: rgba(255,255,255,0.4);
      font-size: 0.8rem;
      font-weight: 700;
    }

    /* Google button */
    .auth-btn-google {
      --border-color: rgba(255,255,255,0.25);
      --color: white;
      --border-radius: 12px;
      font-weight: 700;
    }

    /* Switch */
    .auth-switch {
      text-align: center;
      color: rgba(255,255,255,0.5);
      font-size: 0.85rem;
      margin: 20px 0 0;
    }
    .auth-switch a {
      color: #ffcc00;
      font-weight: 700;
      text-decoration: none;
    }
  `],
  imports: [
    IonButton,
    IonInput,
    IonIcon,
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
  ],
})
export class LoginPage {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  loginForm = this.fb.group({
    email: ['', [Validators.email, Validators.required]],
    password: ['', Validators.minLength(6)],
  });

  onSubmit() {
    const { email, password } = this.loginForm.value;
    this.authService.login(email!, password!);
  }

  loginWithGoogle() {
    this.authService.signInWithGoogle();
  }
}