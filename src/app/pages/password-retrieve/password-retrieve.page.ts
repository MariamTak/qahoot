import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth';
import { RouterLink } from '@angular/router';
import { IonButton, IonInput, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { mailOutline, arrowBackOutline } from 'ionicons/icons';

@Component({
  selector: 'app-password-retrieve',
  template: `
    <div class="auth-page">

      <div class="auth-hero">
        <div class="auth-logo">Qahoot</div>
        <p class="auth-tagline">Reset your password</p>
      </div>

      <div class="auth-card">
        <div class="auth-icon-wrap">
          <ion-icon name="mail-outline"></ion-icon>
        </div>
        <h2 class="auth-title">Forgot Password?</h2>
        <p class="auth-desc">
          Enter your email and we'll send you a link to reset your password.
        </p>

        <form [formGroup]="passwordRetrieveForm" (ngSubmit)="onSubmit()">
          <div class="auth-field">
            <ion-icon name="mail-outline"></ion-icon>
            <ion-input
              formControlName="email"
              type="email"
              placeholder="your@email.com"
              class="auth-input"
            ></ion-input>
          </div>

          <ion-button expand="block" type="submit" class="auth-btn-primary">
            Send Reset Link
          </ion-button>
        </form>

        <a routerLink="/login" class="auth-back">
          <ion-icon name="arrow-back-outline"></ion-icon>
          Back to Login
        </a>
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
      text-align: center;
    }

    .auth-icon-wrap {
      width: 64px; height: 64px; border-radius: 50%;
      background: rgba(255,204,0,0.15);
      border: 2px solid rgba(255,204,0,0.3);
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 16px;
    }
    .auth-icon-wrap ion-icon {
      font-size: 1.8rem; color: #ffcc00;
    }

    .auth-title {
      color: white; font-size: 1.4rem; font-weight: 900;
      margin: 0 0 8px;
    }
    .auth-desc {
      color: rgba(255,255,255,0.5); font-size: 0.88rem;
      line-height: 1.5; margin: 0 0 24px;
    }

    .auth-field {
      display: flex; align-items: center; gap: 12px;
      background: rgba(255,255,255,0.1);
      border: 1px solid rgba(255,255,255,0.15);
      border-radius: 12px; padding: 4px 16px;
      margin-bottom: 20px;
      transition: border-color 0.2s;
      text-align: left;
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

    .auth-btn-primary {
      --background: #ffcc00;
      --background-activated: #e6b800;
      --color: #111;
      --border-radius: 12px;
      --box-shadow: 0 5px 0 #e6b800;
      font-weight: 900; font-size: 1rem;
    }

    .auth-back {
      display: flex; align-items: center; justify-content: center;
      gap: 6px; margin-top: 20px;
      color: rgba(255,255,255,0.5); font-size: 0.88rem;
      font-weight: 700; text-decoration: none;
      transition: color 0.2s;
    }
    .auth-back:hover { color: #ffcc00; }
    .auth-back ion-icon { font-size: 1rem; }
  `],
  imports: [
    IonButton, IonInput, IonIcon,
    CommonModule, ReactiveFormsModule, RouterLink,
  ],
})
export class PasswordRetrievePage {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  passwordRetrieveForm = this.fb.group({
    email: ['', Validators.email],
  });

  constructor() {
    addIcons({ mailOutline, arrowBackOutline });
  }

  onSubmit() {
    this.authService.sendResetPasswordLink(
      this.passwordRetrieveForm.value.email!
    );
  }
}