import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonContent, IonHeader, IonTitle, IonToolbar,
  IonButton, IonIcon, IonSpinner, IonFooter
  
} from '@ionic/angular/standalone';
import { firstValueFrom, Subscription } from 'rxjs';
import { GameService } from 'src/app/services/game';
import { Game } from 'src/app/models/game';
import { addIcons } from 'ionicons';
import { playOutline, copyOutline, checkmarkOutline, peopleOutline } from 'ionicons/icons';
import { QRCodeComponent } from 'angularx-qrcode';
import { PageFooter } from 'src/app/components/page-footer/page-footer.component';
import { AuthService } from 'src/app/services/auth';
import { PageHeader } from 'src/app/components/page-header/page-header.component';

@Component({
  selector: 'game-waiting-page',
  template: `
<page-header [translucent]="true"></page-header>

<ion-content [fullscreen]="true">
  <div class="kh-page">

    @if (!game()) {
      <div class="kh-loading">
        <ion-spinner name="crescent" class="kh-spinner-main"></ion-spinner>
        <p>Loading lobby…</p>
      </div>
    } @else {

      <!-- Header -->
      <div class="kh-header">
        <div class="kh-host-badge">Host</div>
      </div>

      <!-- Live badge -->
      <div class="kh-live-badge">
        <span class="kh-pulse-ring"></span>
        <span class="kh-pulse-dot"></span>
        Waiting for players
      </div>

      <!-- Entry code card -->
      <div class="kh-code-card">
        <span class="kh-code-label">Game PIN</span>
        <span class="kh-code-value">{{ game()!.entryCode }}</span>
        <button class="kh-copy-btn" [class.copied]="copied()" (click)="copyCode()">
          <ion-icon [name]="copied() ? 'checkmark-outline' : 'copy-outline'"></ion-icon>
          {{ copied() ? 'Copied!' : 'Copy PIN' }}
        </button>
      </div>

      <!-- QR + Players row -->
      <div class="kh-middle-row">

        <!-- QR -->
        <div class="kh-qr-card">
          <qrcode
            [qrdata]="game()!.entryCode"
            [width]="140"
            [errorCorrectionLevel]="'M'"
          />
          <p class="kh-qr-hint">Scan to join</p>
        </div>

        <!-- Players -->
        <div class="kh-players-card">
          <div class="kh-players-header">
            <ion-icon name="people-outline"></ion-icon>
            <span>{{ game()!.players.length }} joined</span>
          </div>

          <div class="kh-players-list">
            @if (game()!.players.length === 0) {
              <div class="kh-empty">Waiting for players…</div>
            }
            @for (player of game()!.players; track player.uid) {
              <div class="kh-player-row">
                <div class="kh-avatar">{{ player.alias[0].toUpperCase() }}</div>
                <span class="kh-player-name">{{ player.alias }}</span>
              </div>
            }
          </div>
        </div>

      </div>

      <!-- Start button -->
      <button
        class="kh-start-btn"
        [disabled]="game()!.players.length < 2 || starting()"
        (click)="startGame()"
      >
        @if (starting()) {
          <ion-spinner name="crescent" class="kh-btn-spinner"></ion-spinner>
          Starting…
        } @else {
          <ion-icon name="play-outline"></ion-icon>
          Start Game!
        }
      </button>

      @if (game()!.players.length === 0) {
        <p class="kh-start-hint">Need at least 2 players to start</p>
      }

    }
  </div>
</ion-content>

<ion-footer>
  <page-footer></page-footer>
</ion-footer>
  `,
  styles: [`
    :host {
      --kh-purple: #46178f;
      --kh-purple-dark: #2d0f5e;
      --kh-yellow: #ffcc00;
      --kh-yellow-dark: #e6b800;
      --kh-green: #26890c;
      --kh-green-dark: #1a5c08;
      --kh-radius: 12px;
      --kh-font: 'Nunito', sans-serif;
      --kh-font-body: 'Nunito Sans', sans-serif;
    }

    ion-content { --background: var(--kh-purple); }

    .kh-page {
      min-height: 100vh;
      background: var(--kh-purple);
      background-image:
        radial-gradient(circle at 15% 15%, rgba(255,255,255,0.07) 0%, transparent 45%),
        radial-gradient(circle at 85% 85%, rgba(255,255,255,0.04) 0%, transparent 45%);
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 32px 20px 48px;
      gap: 18px;
      font-family: var(--kh-font);
    }

    /* Loading */
    .kh-loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      margin-top: 40%;
      color: rgba(255,255,255,0.7);
      font-family: var(--kh-font-body);
    }
    .kh-spinner-main { --color: var(--kh-yellow); width: 40px; height: 40px; }

    /* Header */
    .kh-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      max-width: 480px;
    }
    .kh-logo {
      font-size: 1.5rem;
      font-weight: 900;
      color: white;
      text-shadow: 0 3px 0 rgba(0,0,0,0.3);
    }
    .kh-host-badge {
      background: var(--kh-yellow);
      color: #111;
      font-size: 0.7rem;
      font-weight: 900;
      padding: 4px 12px;
      border-radius: 99px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      box-shadow: 0 3px 0 var(--kh-yellow-dark);
    }

    /* Live badge */
    .kh-live-badge {
      position: relative;
      display: flex;
      align-items: center;
      gap: 12px;
      background: rgba(255,255,255,0.12);
      border: 2px solid rgba(255,255,255,0.25);
      border-radius: 99px;
      padding: 10px 22px 10px 18px;
      color: white;
      font-weight: 800;
      font-size: 0.92rem;
    }
    .kh-pulse-ring {
      width: 14px; height: 14px;
      border-radius: 50%;
      border: 2px solid var(--kh-yellow);
      animation: kh-pulse 1.5s ease-out infinite;
      flex-shrink: 0;
    }
    .kh-pulse-dot {
      position: absolute;
      left: 20px;
      width: 8px; height: 8px;
      border-radius: 50%;
      background: var(--kh-yellow);
    }
    @keyframes kh-pulse {
      0%   { transform: scale(0.5); opacity: 1; }
      100% { transform: scale(1.8); opacity: 0; }
    }

    /* Code card */
    .kh-code-card {
      width: 100%;
      max-width: 480px;
      background: white;
      border-radius: 20px;
      padding: 20px 28px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      box-shadow: 0 8px 0 rgba(0,0,0,0.25), 0 12px 32px rgba(0,0,0,0.25);
    }
    .kh-code-label {
      color: #999;
      font-family: var(--kh-font-body);
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 2px;
    }
    .kh-code-value {
      color: var(--kh-purple);
      font-size: 3.2rem;
      font-weight: 900;
      letter-spacing: 12px;
      line-height: 1;
    }
    .kh-copy-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 20px;
      border: 2px solid var(--kh-purple);
      border-radius: 99px;
      background: transparent;
      color: var(--kh-purple);
      font-family: var(--kh-font);
      font-weight: 800;
      font-size: 0.85rem;
      cursor: pointer;
      transition: all 0.15s;
    }
    .kh-copy-btn.copied {
      background: var(--kh-green);
      border-color: var(--kh-green);
      color: white;
    }
    .kh-copy-btn ion-icon { font-size: 1rem; }

    /* Middle row */
    .kh-middle-row {
      width: 100%;
      max-width: 480px;
      display: flex;
      gap: 14px;
      align-items: flex-start;
    }

    /* QR card */
    .kh-qr-card {
      background: white;
      border-radius: 16px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      box-shadow: 0 6px 0 rgba(0,0,0,0.2);
      flex-shrink: 0;
    }
    .kh-qr-hint {
      color: #888;
      font-family: var(--kh-font-body);
      font-size: 0.75rem;
      margin: 0;
    }

    /* Players card */
    .kh-players-card {
      flex: 1;
      background: rgba(255,255,255,0.1);
      border: 2px solid rgba(255,255,255,0.18);
      border-radius: 16px;
      overflow: hidden;
      min-height: 172px;
    }
    .kh-players-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 14px;
      background: rgba(255,255,255,0.1);
      color: white;
      font-weight: 800;
      font-size: 0.88rem;
      border-bottom: 1px solid rgba(255,255,255,0.12);
    }
    .kh-players-header ion-icon { font-size: 1.1rem; }
    .kh-players-list {
      padding: 8px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      max-height: 200px;
      overflow-y: auto;
    }
    .kh-empty {
      color: rgba(255,255,255,0.45);
      font-family: var(--kh-font-body);
      font-size: 0.85rem;
      text-align: center;
      padding: 20px 8px;
    }
    .kh-player-row {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 10px;
      background: rgba(255,255,255,0.08);
      border-radius: 8px;
      animation: kh-pop-in 0.25s ease;
    }
    @keyframes kh-pop-in {
      from { transform: scale(0.85); opacity: 0; }
      to   { transform: scale(1);    opacity: 1; }
    }
    .kh-avatar {
      width: 32px; height: 32px;
      border-radius: 50%;
      background: var(--kh-yellow);
      color: #111;
      font-weight: 900;
      font-size: 0.9rem;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 3px 0 var(--kh-yellow-dark);
    }
    .kh-player-name {
      color: white;
      font-weight: 700;
      font-size: 0.88rem;
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* Start button */
    .kh-start-btn {
      width: 100%;
      max-width: 480px;
      padding: 18px;
      border: none;
      border-radius: var(--kh-radius);
      background: var(--kh-green);
      color: white;
      font-family: var(--kh-font);
      font-weight: 900;
      font-size: 1.3rem;
      cursor: pointer;
      box-shadow: 0 6px 0 var(--kh-green-dark);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      transition: transform 0.1s, box-shadow 0.1s;
    }
    .kh-start-btn:active:not([disabled]) {
      transform: translateY(4px);
      box-shadow: 0 2px 0 var(--kh-green-dark);
    }
    .kh-start-btn[disabled] {
      opacity: 0.45;
      cursor: not-allowed;
    }
    .kh-start-btn ion-icon { font-size: 1.3rem; }
    .kh-btn-spinner { --color: white; width: 22px; height: 22px; }

    .kh-start-hint {
      color: rgba(255,255,255,0.5);
      font-family: var(--kh-font-body);
      font-size: 0.82rem;
      margin: -8px 0 0;
      text-align: center;
    }
  `],
  standalone: true,
  imports: [
    IonContent, IonIcon, IonSpinner, IonFooter,
    QRCodeComponent, PageFooter, PageHeader
  ],
})
export class GameWaitingPage implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private gameService = inject(GameService);
  private authService = inject(AuthService);
  isAdmin  = signal(false);
  myAlias  = signal('');

  game = signal<Game | null>(null);
  starting = signal(false);
  copied = signal(false);

  private sub!: Subscription;

  constructor() {
    addIcons({ playOutline, copyOutline, checkmarkOutline, peopleOutline });
  }

 async ngOnInit() {

  const gameId = this.route.snapshot.paramMap.get('id')!;

  // Fetch user ONCE before subscribing
  const user = await firstValueFrom(this.authService.getConnectedUser());


  this.sub = this.gameService.getGame(gameId).subscribe((game) => {
    this.game.set(game);

    // Role detection — runs on every update but user is already resolved
    this.isAdmin.set(user?.uid === game.adminId);

    // Track player's own alias for leaveGame
    const me = game.players.find(p => p.uid === user?.uid);
    if (me) this.myAlias.set(me.alias);

    // Auto-redirect when admin starts the game
    if (game.status === 'in-progress') {
      this.router.navigate(['/game', gameId, 'play']);
    }

  });

}
  async copyCode() {
    await navigator.clipboard.writeText(this.game()!.entryCode);
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 2000);
  }

  async startGame() {
    const gameId = this.game()!.id;
    this.starting.set(true);
    try {
      await this.gameService.startGame(gameId);
      this.router.navigate(['/game', gameId, 'play']);
    } finally {
      this.starting.set(false);
    }
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }
}