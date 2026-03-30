import { Component, inject, input } from '@angular/core';
import {
  IonHeader, IonToolbar,
  IonButtons, IonButton, IonIcon,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { logOutOutline } from 'ionicons/icons';
import { AuthService } from 'src/app/services/auth';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';

@Component({
  selector: 'page-header',
  template: `
    <ion-header [translucent]="translucent()" [collapse]="collapse()">
      <ion-toolbar>

        <div slot="start" class="kh-logo">Qahoot</div>

        @if (connectedUser()) {
          <ion-buttons slot="end">
            <ion-button (click)="logout()">
              <ion-icon slot="icon-only" name="log-out-outline"></ion-icon>
            </ion-button>
          </ion-buttons>
        }

      </ion-toolbar>
    </ion-header>
  `,
  styles: [`
    ion-toolbar {
      --background: #46178f;
      --color: white;
    }
    .kh-logo {
      font-family: 'Nunito', sans-serif;
      font-size: 1.5rem;
      font-weight: 900;
      color: #ffcc00;
      text-shadow: 0 6px 0 rgba(0,0,0,0.3);
      letter-spacing: 2px;
      padding-left: 30px;
    }
  `],
  imports: [IonHeader, IonToolbar, IonButtons, IonButton, IonIcon],
})
export class PageHeader {
  readonly translucent = input<boolean>();
  readonly collapse = input<'condense' | 'fade' | undefined>(undefined);

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly connectedUser = toSignal(this.authService.getConnectedUser());

  constructor() {
    addIcons({ logOutOutline });
  }

  async logout() {
    await this.authService.logout();
    this.router.navigateByUrl('/login');
  }
}