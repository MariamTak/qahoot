import { Component, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonFooter, IonContent, IonIcon, IonInput, IonSpinner } from '@ionic/angular/standalone';
import { PageFooter } from '../components/page-footer/page-footer.component';
import { addIcons } from 'ionicons';
import { qrCodeOutline, keypadOutline, peopleOutline, checkmarkCircleOutline } from 'ionicons/icons';
import { CapacitorBarcodeScanner, CapacitorBarcodeScannerTypeHint } from '@capacitor/barcode-scanner';
import { GameService } from '../services/game';
import { AuthService } from '../services/auth';
import { firstValueFrom } from 'rxjs';
import { Game } from '../models/game';
import { FormsModule } from '@angular/forms';
import { UserService } from '../services/user';
import { PageHeader } from '../components/page-header/page-header.component';



@Component({
  selector: 'join-game',
  template: `
  <page-header [translucent]="true"></page-header>

    <ion-content [fullscreen]="true">
      <div class="kh-page">

        <div class="kh-header">
          <p class="kh-tagline">Join the fun</p>
        </div>

        @if (step() === 'enter-code') {
          <div class="kh-card">

            <div class="kh-toggle">
              <button class="kh-toggle-btn" [class.active]="mode() === 'code'" (click)="mode.set('code')">
                <ion-icon name="keypad-outline"></ion-icon>
                Enter Code
              </button>
              <button class="kh-toggle-btn" [class.active]="mode() === 'qr'" (click)="mode.set('qr')">
                <ion-icon name="qr-code-outline"></ion-icon>
                Scan QR
              </button>
            </div>

            @if (mode() === 'code') {
              <div class="kh-panel">
                <p class="kh-hint">Type the game PIN below</p>
                <div class="kh-input-wrap">
                  <ion-input
                    placeholder="Game PIN"
                    [maxlength]="8"
                    type="text"
                    [(ngModel)]="gameCode"
                    class="kh-input"
                  ></ion-input>
                </div>
                @if (error()) {
                  <div class="kh-error">⚠️ {{ error() }}</div>
                }
                <button class="kh-join-btn" [disabled]="joining()" (click)="joinWithCode()">
                  @if (joining()) {
                    <ion-spinner name="crescent" class="kh-spinner"></ion-spinner>
                  } @else {
                    Enter!
                  }
                </button>
              </div>
            }

            @if (mode() === 'qr') {
              <div class="kh-panel">
                <p class="kh-hint">Point your camera at the QR code</p>
                @if (error()) {
                  <div class="kh-error">⚠️ {{ error() }}</div>
                }
                @if (scannedCode()) {
                  <div class="kh-scanned">
                    <div class="kh-scanned-icon">✓</div>
                    <p>Code: <strong>{{ scannedCode() }}</strong></p>
                  </div>
                  <button class="kh-join-btn" [disabled]="joining()" (click)="joinWithScannedCode()">
                    @if (joining()) {
                      <ion-spinner name="crescent" class="kh-spinner"></ion-spinner>
                    } @else {
                      Join Now!
                    }
                  </button>
                } @else {
                  <button class="kh-scan-btn" [disabled]="scanning()" (click)="startScan()">
                    <ion-icon name="qr-code-outline"></ion-icon>
                    {{ scanning() ? 'Scanning...' : 'Open Camera' }}
                  </button>
                }
              </div>
            }

          </div>
        }

        @if (step() === 'waiting') {
          <div class="kh-waiting">

            <div class="kh-pulse-badge">
              <span class="kh-pulse-ring"></span>
              <span class="kh-pulse-dot"></span>
              Waiting for host…
            </div>

            <div class="kh-code-display">
              <span class="kh-code-label">Room PIN</span>
              <span class="kh-code-value">{{ currentGame()?.entryCode }}</span>
            </div>

            <div class="kh-players-card">
              <div class="kh-players-header">
                <ion-icon name="people-outline"></ion-icon>
                <span>{{ currentGame()?.players?.length ?? 0 }} player(s) joined</span>
              </div>
              <div class="kh-players-list">
                @for (player of currentGame()?.players ?? []; track player.uid) {
                  <div class="kh-player-row" [class.is-me]="player.uid === currentUserId()">
                    <div class="kh-avatar">{{ player.alias[0]?.toUpperCase() }}</div>
                    <span class="kh-player-name">{{ player.alias }}</span>
                    @if (player.uid === currentUserId()) {
                      <span class="kh-you-badge">You</span>
                    }
                  </div>
                }
              </div>
            </div>

            <p class="kh-waiting-hint">The host will start the game when everyone's ready!</p>
            <button class="kh-leave-btn" (click)="leaveGame()">Leave Game</button>
          </div>
        }

      </div>
    </ion-content>

    <ion-footer>
      <page-footer></page-footer>
    </ion-footer>
  `,
  styles: [`
    :host {
      --kh-purple:      #46178f;
      --kh-purple-dark: #2d0f5e;
      --kh-yellow:      #ffcc00;
      --kh-yellow-dark: #e6b800;
      --kh-red:         #e21b3c;
      --kh-green:       #26890c;
      --kh-radius:      12px;
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
      padding: 40px 20px 56px;
      gap: 0;
    }

    /* Header */
    .kh-header { text-align: center; margin-bottom: 32px; }
    .kh-logo {
      font-size: 2.2rem;
      font-weight: 900;
      color: white;
      font-family: var(--app-font-heading);
      text-shadow: 0 3px 0 rgba(0,0,0,0.3);
      letter-spacing: -0.5px;
    }
    .kh-tagline {
      margin: 4px 0 0;
      color: rgba(255,255,255,0.65);
      font-family: var(--app-font-body);
      font-size: 0.9rem;
    }

    /* Card */
    .kh-card {
      width: 100%;
      max-width: 400px;
      background: white;
      border-radius: 20px;
      padding: 28px 24px;
      box-shadow: 0 8px 0 rgba(0,0,0,0.25), 0 16px 40px rgba(0,0,0,0.3);
    }

    /* Toggle */
    .kh-toggle {
      display: flex;
      gap: 6px;
      background: #f0f0f0;
      border-radius: 10px;
      padding: 4px;
      margin-bottom: 24px;
    }
    .kh-toggle-btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 10px;
      border: none;
      border-radius: 8px;
      background: transparent;
      color: #777;
      font-family: var(--app-font-heading);
      font-weight: 800;
      font-size: 0.85rem;
      cursor: pointer;
      transition: all 0.15s;
    }
    .kh-toggle-btn.active {
      background: var(--kh-purple);
      color: white;
      box-shadow: 0 3px 0 var(--kh-purple-dark);
    }
    .kh-toggle-btn ion-icon { font-size: 1.1rem; }

    /* Panel */
    .kh-panel { display: flex; flex-direction: column; gap: 16px; }
    .kh-hint {
      text-align: center;
      color: #666;
      font-family: var(--app-font-body);
      font-size: 0.92rem;
      margin: 0;
    }

    /* Input */
    .kh-input-wrap {
      border: 3px solid #e0e0e0;
      border-radius: var(--kh-radius);
      overflow: hidden;
      transition: border-color 0.15s;
    }
    .kh-input-wrap:focus-within { border-color: var(--kh-purple); }
    .kh-input {
      --background: #fafafa;
      --color: #111;
      --placeholder-color: #bbb;
      --padding-start: 16px;
      --padding-end: 16px;
      font-family: var(--app-font-heading);
      font-weight: 900;
      font-size: 1.6rem;
      letter-spacing: 6px;
      text-align: center;
      text-transform: uppercase;
      height: 68px;
    }

    /* Error */
    .kh-error {
      background: #fff0f2;
      border: 2px solid #ffc0c8;
      border-radius: 8px;
      color: var(--kh-red);
      font-family: var(--app-font-body);
      font-weight: 600;
      font-size: 0.88rem;
      padding: 10px 14px;
      text-align: center;
    }

    /* Join button */
    .kh-join-btn {
      width: 100%;
      padding: 16px;
      border: none;
      border-radius: var(--kh-radius);
      background: var(--kh-yellow);
      color: #111;
      font-family: var(--app-font-heading);
      font-weight: 900;
      font-size: 1.2rem;
      cursor: pointer;
      box-shadow: 0 5px 0 var(--kh-yellow-dark);
      transition: transform 0.1s, box-shadow 0.1s;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .kh-join-btn:active:not([disabled]) {
      transform: translateY(3px);
      box-shadow: 0 2px 0 var(--kh-yellow-dark);
    }
    .kh-join-btn[disabled] { opacity: 0.55; cursor: not-allowed; }
    .kh-spinner { --color: #111; width: 22px; height: 22px; }

    /* Scan button */
    .kh-scan-btn {
      width: 100%;
      padding: 16px;
      border: 3px dashed var(--kh-purple);
      border-radius: var(--kh-radius);
      background: transparent;
      color: var(--kh-purple);
      font-family: var(--app-font-heading);
      font-weight: 800;
      font-size: 1rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: background 0.15s;
    }
    .kh-scan-btn:active { background: rgba(70,23,143,0.07); }
    .kh-scan-btn[disabled] { opacity: 0.5; }

    /* Scanned */
    .kh-scanned {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 16px;
      background: #f0fff4;
      border: 2px solid #b2f0c8;
      border-radius: 10px;
      text-align: center;
    }
    .kh-scanned-icon {
      width: 40px; height: 40px;
      border-radius: 50%;
      background: var(--kh-green);
      color: white;
      font-size: 1.3rem;
      font-weight: 900;
      display: flex; align-items: center; justify-content: center;
    }
    .kh-scanned p { margin: 0; color: #1a6b2a; font-family: var(--app-font-body); font-size: 0.9rem; }

    /* Waiting room */
    .kh-waiting {
      width: 100%;
      max-width: 400px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20px;
    }

    .kh-pulse-badge {
      position: relative;
      display: flex;
      align-items: center;
      gap: 12px;
      background: rgba(255,255,255,0.12);
      border: 2px solid rgba(255,255,255,0.25);
      border-radius: 99px;
      padding: 10px 22px 10px 18px;
      color: white;
      font-family: var(--app-font-heading);
      font-weight: 800;
      font-size: 0.95rem;
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

    .kh-code-display {
      text-align: center;
      background: white;
      border-radius: 16px;
      padding: 20px 48px;
      box-shadow: 0 6px 0 rgba(0,0,0,0.2), 0 10px 30px rgba(0,0,0,0.2);
      width: 100%;
    }
    .kh-code-label {
      display: block;
      color: #999;
      font-family: var(--app-font-body);
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-bottom: 6px;
    }
    .kh-code-value {
      display: block;
      color: var(--kh-purple);
      font-family: var(--app-font-heading);
      font-size: 3rem;
      font-weight: 900;
      letter-spacing: 10px;
    }

    .kh-players-card {
      width: 100%;
      background: rgba(255,255,255,0.1);
      border: 2px solid rgba(255,255,255,0.18);
      border-radius: 16px;
      overflow: hidden;
    }
    .kh-players-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      background: rgba(255,255,255,0.1);
      color: white;
      font-family: var(--app-font-heading);
      font-weight: 800;
      font-size: 0.9rem;
      border-bottom: 1px solid rgba(255,255,255,0.12);
    }
    .kh-players-header ion-icon { font-size: 1.1rem; }
    .kh-players-list {
      padding: 8px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      max-height: 220px;
      overflow-y: auto;
    }
    .kh-player-row {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 9px 12px;
      background: rgba(255,255,255,0.07);
      border-radius: 10px;
      animation: kh-pop-in 0.25s ease;
    }
    @keyframes kh-pop-in {
      from { transform: scale(0.9); opacity: 0; }
      to   { transform: scale(1);   opacity: 1; }
    }
    .kh-player-row.is-me {
      background: rgba(255,204,0,0.18);
      border: 1px solid rgba(255,204,0,0.35);
    }
    .kh-avatar {
      width: 36px; height: 36px;
      border-radius: 50%;
      background: var(--kh-yellow);
      color: #111;
      font-family: var(--app-font-heading);
      font-weight: 900;
      font-size: 1rem;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 3px 0 var(--kh-yellow-dark);
    }
    .kh-player-name {
      color: white;
      font-family: var(--app-font-body);
      font-weight: 600;
      font-size: 0.95rem;
      flex: 1;
    }
    .kh-you-badge {
      background: var(--kh-yellow);
      color: #111;
      font-family: var(--app-font-heading);
      font-size: 0.65rem;
      font-weight: 900;
      padding: 2px 8px;
      border-radius: 99px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .kh-waiting-hint {
      color: rgba(255,255,255,0.55);
      font-family: var(--app-font-body);
      font-size: 0.88rem;
      text-align: center;
      margin: 0;
    }

    .kh-leave-btn {
      padding: 11px 32px;
      border: 2px solid rgba(255,255,255,0.25);
      border-radius: 99px;
      background: transparent;
      color: rgba(255,255,255,0.6);
      font-family: var(--app-font-heading);
      font-weight: 700;
      font-size: 0.88rem;
      cursor: pointer;
      transition: all 0.15s;
    }
    .kh-leave-btn:active {
      background: rgba(226,27,60,0.25);
      border-color: var(--kh-red);
      color: white;
    }
  `],
  imports: [
    IonContent, IonFooter, IonIcon, IonInput, IonSpinner, PageFooter, FormsModule, PageHeader
  ],
})
export class JoinGamePage {
  private gameService = inject(GameService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private userService = inject(UserService);

  mode = signal<'code' | 'qr'>('code');
  scanning = signal(false);
  joining = signal(false);
  scannedCode = signal('');
  error = signal('');
  step = signal<'enter-code' | 'waiting'>('enter-code');
  currentGame = signal<Game | null>(null);
  currentUserId = signal<string | null>(null);

  gameCode = '';
  private foundGameId = '';
  private aliasInput = '';
  private gameSub: any;

  constructor() {
    addIcons({ qrCodeOutline, keypadOutline, peopleOutline, checkmarkCircleOutline });
    this.authService.getConnectedUser().subscribe(u => {
      this.currentUserId.set(u?.uid ?? null);
    });
  }

  async startScan() {
    this.error.set('');
    this.scannedCode.set('');
    this.scanning.set(true);
    try {
      const result = await CapacitorBarcodeScanner.scanBarcode({
        hint: CapacitorBarcodeScannerTypeHint.ALL,
      });
      if (result?.ScanResult) {
        this.scannedCode.set(result.ScanResult);
      } else {
        this.error.set('No code detected. Please try again.');
      }
    } catch (err) {
      this.error.set('Camera access denied or scan cancelled.');
      console.error('Scan error:', err);
    } finally {
      this.scanning.set(false);
    }
  }

  async joinWithCode() {
    const code = this.gameCode.trim();
    if (!code) {
      this.error.set('Please enter a game code.');
      return;
    }
    await this.doJoin(code);
  }

  async joinWithScannedCode() {
    const code = this.scannedCode().trim();
    if (!code) return;
    await this.doJoin(code);
  }

  private async doJoin(code: string) {
    this.error.set('');
    this.joining.set(true);
    try {
      const games = await firstValueFrom(this.gameService.getGameByEntryCode(code));
      if (!games || games.length === 0) {
        this.error.set('Invalid game code. Please check and try again.');
        return;
      }
      const game = games[0];
      this.foundGameId = game.id;

      const user = await firstValueFrom(this.authService.getConnectedUser());
      if (!user) {
        this.error.set('You must be logged in to join a game.');
        return;
      }

      const userDoc = await firstValueFrom(this.userService.getById(user.uid));
      this.aliasInput = userDoc?.alias ?? user.displayName ?? user.email ?? user.uid;

      await this.gameService.joinGame(this.foundGameId, this.aliasInput);

      this.gameSub = this.gameService.getGame(this.foundGameId).subscribe((liveGame) => {
        this.currentGame.set(liveGame);
        if (liveGame?.status === 'in-progress') {
          this.router.navigate(['/game', this.foundGameId, 'play']);
        }
      });

      this.step.set('waiting');
    } catch (err) {
      console.error('Error joining game:', err);
      this.error.set('Something went wrong. Please try again.');
    } finally {
      this.joining.set(false);
    }
  }

  async leaveGame() {
    try {
      await this.gameService.leaveGame(this.foundGameId, this.aliasInput);
      this.gameSub?.unsubscribe();
      this.step.set('enter-code');
      this.currentGame.set(null);
    } catch (err) {
      console.error('Error leaving game:', err);
    }
  }
}