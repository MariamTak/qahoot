// src/app/game-results/game-results.page.ts
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { GameService } from 'src/app/services/game';
import { PlayerScore } from 'src/app/models/player';
import { trophyOutline, homeOutline, medalOutline } from 'ionicons/icons';
import { PageHeader } from 'src/app/components/page-header/page-header.component';
@Component({
  selector: 'app-game-results',
  standalone: true,
  imports: [CommonModule, IonContent, IonIcon, PageHeader],
  template: `

<page-header [translucent]="true"></page-header>

    <ion-content>
      <div class="gr-page">

        <div class="gr-hero">
          <h1 class="gr-title">Well played!</h1>
          <p class="gr-subtitle">Final Results</p>
        </div>

        @if (scores().length >= 1) {
          <div class="gr-podium">

            @if (scores().length >= 2) {
              <div class="gr-podium-col second">
                <div class="gr-podium-name">{{ scores()[1].alias }}</div>
                <div class="gr-podium-score">{{ scores()[1].totalScore }} pts</div>
                <div class="gr-podium-block second-block">2</div>
              </div>
            }

            <div class="gr-podium-col first">
              <div class="gr-podium-crown"><ion-icon name="trophy-outline"></ion-icon></div>
              <div class="gr-podium-name">{{ scores()[0].alias }}</div>
              <div class="gr-podium-score">{{ scores()[0].totalScore }} pts</div>
              <div class="gr-podium-block first-block">1</div>
            </div>

            @if (scores().length >= 3) {
              <div class="gr-podium-col third">
                <div class="gr-podium-avatar"><ion-icon name="medal-outline"></ion-icon></div>
                <div class="gr-podium-name">{{ scores()[2].alias }}</div>
                <div class="gr-podium-score">{{ scores()[2].totalScore }} pts</div>
                <div class="gr-podium-block third-block">3</div>
              </div>
            }

          </div>
        }

        @if (scores().length > 3) {
          <div class="gr-leaderboard">
            <div class="gr-lb-title">Full Standings</div>
            @for (s of scores(); track s.uid; let i = $index) {
              @if (i >= 3) {
                <div class="gr-lb-row" [style.animation-delay]="(i * 0.05) + 's'">
                  <span class="gr-lb-rank">{{ i + 1 }}</span>
                  <span class="gr-lb-name">{{ s.alias }}</span>
                  <span class="gr-lb-pts">{{ s.totalScore }} pts</span>
                </div>
              }
            }
          </div>
        }

        <div class="gr-actions">
          <button class="gr-btn home" (click)="goHome()">
            <ion-icon name="home-outline"></ion-icon>
            Back to Home
          </button>
        </div>

      </div>
    </ion-content>
  `,
  styles: [`
    ion-content { --background: linear-gradient(135deg, #2d0f5e 0%, #1a0a3a 100%); }
    ion-toolbar { --background: #46178f; --color: white; }

    .gr-page {
      min-height: 100vh;
      display: flex; flex-direction: column; align-items: center;
      padding: 32px 20px 48px; gap: 28px;
      font-family: 'Nunito', sans-serif;
    }

    /* Hero */
    .gr-hero { text-align: center; }

    .gr-trophy {
      color: #ffcc00;
      animation: bounce 1s ease infinite alternate;
    }
    .gr-trophy ion-icon { font-size: 4rem; }

    @keyframes bounce {
      from { transform: translateY(0); }
      to { transform: translateY(-12px); }
    }

    .gr-title {
      font-size: 2rem; font-weight: 900; color: #ffcc00;
      text-shadow: 0 4px 0 rgba(0,0,0,0.3); margin: 8px 0 4px;
    }
    .gr-subtitle { color: rgba(255,255,255,0.6); font-weight: 700; margin: 0; }

    /* Podium */
    .gr-podium {
      display: flex; align-items: flex-end; justify-content: center;
      gap: 8px; width: 100%; max-width: 380px;
    }
    .gr-podium-col {
      display: flex; flex-direction: column; align-items: center; gap: 4px;
      flex: 1;
    }

    .gr-podium-crown { color: #ffcc00; }
    .gr-podium-crown ion-icon {
      font-size: 1.8rem;
      animation: bounce 0.8s ease infinite alternate;
    }

    .gr-podium-avatar ion-icon { font-size: 2.2rem; }
    .first .gr-podium-avatar ion-icon { color: #ffcc00; }
    .second .gr-podium-avatar ion-icon { color: #c0c0c0; }
    .third .gr-podium-avatar ion-icon { color: #cd7f32; }

    .gr-podium-name {
      color: white; font-weight: 800; font-size: 0.8rem;
      text-align: center; max-width: 80px;
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    }
    .gr-podium-score { color: #ffcc00; font-weight: 900; font-size: 0.85rem; }

    .gr-podium-block {
      width: 100%; border-radius: 8px 8px 0 0;
      display: flex; align-items: center; justify-content: center;
      font-weight: 900; font-size: 1.2rem; color: white;
    }
    .first-block  { height: 100px; background: linear-gradient(180deg, #ffcc00, #e6a800); color: #111; }
    .second-block { height: 70px;  background: linear-gradient(180deg, #c0c0c0, #909090); }
    .third-block  { height: 50px;  background: linear-gradient(180deg, #cd7f32, #a0522d); }

    /* Full leaderboard */
    .gr-leaderboard {
      width: 100%; max-width: 480px;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 20px; padding: 16px;
    }
    .gr-lb-title {
      text-align: center; color: rgba(255,255,255,0.6);
      font-size: 0.75rem; font-weight: 700;
      text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;
    }
    .gr-lb-row {
      display: flex; align-items: center; gap: 12px;
      padding: 10px 14px; border-radius: 10px;
      background: rgba(255,255,255,0.05); margin-bottom: 6px;
      animation: slide-in 0.3s ease both;
    }
    @keyframes slide-in {
      from { transform: translateX(-16px); opacity: 0; }
      to   { transform: none; opacity: 1; }
    }
    .gr-lb-rank { width: 28px; color: rgba(255,255,255,0.4); font-weight: 900; }
    .gr-lb-name { flex: 1; color: white; font-weight: 700; font-size: 0.9rem; }
    .gr-lb-pts  { color: #ffcc00; font-weight: 900; font-size: 0.9rem; }

    /* Actions */
    .gr-actions {
      width: 100%; max-width: 480px;
      display: flex; flex-direction: column; gap: 12px;
    }
    .gr-btn {
      width: 100%; padding: 16px; border: none; border-radius: 14px;
      font-weight: 900; font-size: 1rem; cursor: pointer;
      display: flex; align-items: center; justify-content: center; gap: 10px;
      transition: transform 0.1s;
    }
    .gr-btn:active { transform: translateY(3px); }
    .gr-btn.home {
      background: rgba(255,255,255,0.12); color: white;
      border: 1px solid rgba(255,255,255,0.2);
    }
    .gr-btn ion-icon { font-size: 1.2rem; }
  `]
})
export class GameResultsPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private gameService = inject(GameService);

  scores = signal<PlayerScore[]>([]);
  private gameId!: string;

  constructor() {
    addIcons({ trophyOutline, homeOutline, medalOutline });
  }

  async ngOnInit() {
    this.gameId = this.route.snapshot.paramMap.get('id')!;
    this.gameService.getScores(this.gameId).subscribe(s => {
      this.scores.set([...s].sort((a, b) => b.totalScore - a.totalScore));
    });
  }

  goHome() {
    this.router.navigate(['/']);
  }
}