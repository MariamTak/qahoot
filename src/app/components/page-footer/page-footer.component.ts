import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { home, gameController } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { IonToolbar, IonIcon } from '@ionic/angular/standalone';

@Component({
  selector: 'page-footer',
  template: `
    <ion-toolbar>
      <div class="kh-footer">
        <button class="kh-footer-btn" [class.active]="currentPage === 'home'" (click)="navigateTo('home')">
          <ion-icon [icon]="home"></ion-icon>
          <span>Home</span>
        </button>
        <button class="kh-footer-btn" [class.active]="currentPage === 'join-game'" (click)="navigateTo('join-game')">
          <ion-icon [icon]="gameController"></ion-icon>
          <span>Games</span>
        </button>
      </div>
    </ion-toolbar>
  `,
  imports: [IonToolbar, IonIcon],
  styles: [`
    :host {
      --kh-purple:      #46178f;
      --kh-purple-dark: #2d0f5e;
      --kh-yellow:      #ffcc00;
      --kh-yellow-dark: #e6b800;
      display: block;
      width: 100%;
    }

    ion-toolbar {
      --background: var(--kh-purple);
      --border-color: transparent;
      padding: 0;
    }

    .kh-footer {
      display: flex;
      justify-content: center;
      gap: 2rem;
      padding: 8px 24px 12px;
    }

    .kh-footer-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 3px;
      padding: 8px 28px;
      border: none;
      border-radius: 12px;
      background: transparent;
      color: rgba(255,255,255,0.5);
      font-family: var(--app-font-heading);
      font-weight: 800;
      font-size: 0.75rem;
      cursor: pointer;
      transition: all 0.15s;
    }

    .kh-footer-btn ion-icon {
      font-size: 1.4rem;
      transition: transform 0.15s;
    }

    .kh-footer-btn.active {
      color: var(--kh-yellow);
      background: rgba(255, 204, 0, 0.12);
    }

    .kh-footer-btn.active ion-icon {
      transform: scale(1.15);
      filter: drop-shadow(0 2px 4px rgba(255,204,0,0.4));
    }

    .kh-footer-btn:active:not(.active) {
      background: rgba(255,255,255,0.08);
      color: rgba(255,255,255,0.8);
    }
  `]
})
export class PageFooter {
  home = home;
  gameController = gameController;
  currentPage = '';

  constructor(private router: Router) {
    addIcons({ home, gameController });
 this.router.events.subscribe(() => {
    this.currentPage = this.getPageFromUrl(this.router.url);
  });
}
private getPageFromUrl(url: string): string {
  if (url.includes('join-game')) return 'join-game';
  return 'home';
}    

  navigateTo(page: 'home' | 'join-game') {
    this.currentPage = page;
    this.router.navigate([page]);
  }
}