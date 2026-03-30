import { Component, input, computed, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Question } from 'src/app/models/question';
import { PlayerScore } from 'src/app/models/player';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { checkmarkCircleOutline, arrowForwardOutline, trophyOutline, triangle, star, ellipse, square } from 'ionicons/icons';
import { PageHeader } from 'src/app/components/page-header/page-header.component';
@Component({
  selector: 'app-question-board',
  standalone: true,
  imports: [CommonModule, IonIcon, PageHeader],
  template: `
  <page-header [translucent]="true"></page-header>

    <div class="qb-overlay">
      <div class="qb-card">

        <!-- Question recap -->
        <div class="qb-question">{{ question().text }}</div>

      
      <div class="qb-histogram">
  @for (choice of question().choices; track choice.id; let i = $index) {
    <div
      class="qb-bar-col"
      [class.correct]="i === question().correctChoiceIndex"
      [class.wrong]="i !== question().correctChoiceIndex"
    >
      <div class="qb-bar-count">{{ choiceCount()[i] }}</div>
      <div class="qb-bar-wrap">
        <div
          class="qb-bar"
          [style.height.%]="barHeight()[i]"
          [class.correct]="i === question().correctChoiceIndex"
          [class.wrong]="i !== question().correctChoiceIndex"
        ></div>
      </div>
      <div class="qb-bar-label">
        <ion-icon [name]="['triangle','star','ellipse','square'][i]"></ion-icon>
      </div>
      <div
        class="qb-bar-text"
        [class.correct]="i === question().correctChoiceIndex"
        [class.wrong]="i !== question().correctChoiceIndex"
      >
        {{ choice.text }}
      </div>
    </div>
  }
        </div>

        <!-- Leaderboard -->
        <div class="qb-leaderboard-container">
          <div class="qb-section-title">
            <ion-icon name="trophy-outline"></ion-icon>
            Leaderboard
          </div>
          <div class="qb-players">
            @for (s of sortedScores(); track s.uid; let i = $index) {
              <div class="qb-player-row" [class.top]="i === 0" [class.top-three]="i < 3">
                <span class="qb-rank">
                  @if (i === 0) {
                    🥇
                  } @else if (i === 1) {
                    🥈
                  } @else if (i === 2) {
                    🥉
                  } @else {
                    {{ i + 1 }}
                  }
                </span>
                <span class="qb-alias">{{ s.alias }}</span>
                @if (s.lastQuestionScore > 0) {
                  <span class="qb-delta">+{{ s.lastQuestionScore }}</span>
                }
                <span class="qb-total">{{ s.totalScore }} pts</span>
              </div>
            }
            @if (sortedScores().length === 0) {
              <div class="qb-empty">No scores yet</div>
            }
          </div>
        </div>

        <!-- Admin: next button -->
        @if (isAdmin()) {
          <button class="qb-next-btn" (click)="onNext.emit()">
            <ion-icon [name]="isLast() ? 'trophy-outline' : 'arrow-forward-outline'"></ion-icon>
            {{ isLast() ? 'Finish Game!' : 'Next Question' }}
          </button>
        } @else {
          <div class="qb-waiting">
            <ion-icon name="hourglass-outline"></ion-icon>
            Waiting for host to continue...
          </div>
        }

      </div>
    </div>
  `,
  styles: [`
    .qb-overlay {
      position: fixed;
      inset: 0;
      z-index: 100;
      background: linear-gradient(135deg, #2d0f5e 0%, #1a0a3a 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      overflow-y: auto;
      animation: fade-in 0.3s ease;
    }

    @keyframes fade-in {
      from {
        opacity: 0;
        transform: scale(0.96);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }

    .qb-card {
      width: 100%;
      max-width: 600px;
      display: flex;
      flex-direction: column;
      gap: 24px;
      padding: 24px;
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
      border-radius: 24px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    }

    .qb-question {
      background: white;
      border-radius: 20px;
      padding: 24px;
      text-align: center;
      font-size: 1.2rem;
      font-weight: 900;
      color: #46178f;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      line-height: 1.4;
    }

    /* Stats Summary */
    .qb-stats-summary {
      display: flex;
      gap: 12px;
      justify-content: center;
    }

    .qb-stat-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 20px;
      border-radius: 40px;
      font-weight: 800;
      font-size: 0.9rem;
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(5px);
    }

    .qb-stat-item.correct {
      color: #6ddc4a;
      border: 1px solid rgba(109, 220, 74, 0.3);
    }

    .qb-stat-item.wrong {
      color: #f08080;
      border: 1px solid rgba(240, 128, 128, 0.3);
    }

    .qb-stat-item ion-icon {
      font-size: 1.2rem;
    }

    /* Histogram Container */
    .qb-histogram-container {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 16px;
      padding: 16px;
    }
    .qb-bar.wrong {
  background: rgba(232, 64, 64, 0.5);
}

.qb-bar-text.correct {
  color: #6ddc4a;
  font-weight: 900;
}

.qb-bar-text.wrong {
  color: rgba(255, 255, 255, 0.5);
}

    .qb-histogram-title {
      text-align: center;
      color: rgba(255, 255, 255, 0.7);
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 20px;
    }

    .qb-histogram {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      align-items: end;
      height: 220px;
    }

    .qb-bar-col {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      height: 100%;
    }

    .qb-bar-count {
      color: white;
      font-weight: 900;
      font-size: 0.9rem;
      min-height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .qb-bar-wrap {
      flex: 1;
      width: 100%;
      display: flex;
      align-items: flex-end;
      min-height: 100px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      overflow: hidden;
    }

    .qb-bar {
      width: 100%;
      border-radius: 8px 8px 0 0;
      transition: height 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
      background: rgba(255, 255, 255, 0.3);
      min-height: 4px;
    }

    .qb-bar.correct {
      background: linear-gradient(180deg, #6ddc4a 0%, #26890c 100%);
      box-shadow: 0 0 12px rgba(38, 137, 12, 0.5);
    }

    .qb-bar-label {
      font-size: 1.2rem;
    }

    .qb-bar-col:nth-child(1) .qb-bar-label {
      color: #e84040;
    }

    .qb-bar-col:nth-child(2) .qb-bar-label {
      color: #1368ce;
    }

    .qb-bar-col:nth-child(3) .qb-bar-label {
      color: #d89e00;
    }

    .qb-bar-col:nth-child(4) .qb-bar-label {
      color: #26890c;
    }

    .qb-bar-text {
      font-size: 0.7rem;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.8);
      text-align: center;
      line-height: 1.3;
      max-width: 100%;
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      word-break: break-word;
    }


.qb-bar-col.wrong .qb-bar-label { 
  opacity: 0.5; 
}
.qb-bar-col.wrong .qb-bar-text { 
  opacity: 0.5; 
}
.qb-bar-col.wrong .qb-bar-count { 
  opacity: 0.5; 
}

.qb-bar-col.correct .qb-bar-count { 
  color: #6ddc4a; 
  font-size: 1.2rem; 
}
.qb-bar-col.correct .qb-bar-text { 
  color: #6ddc4a; 
  font-weight: 900; 
}
    .qb-correct-badge {
      color: #6ddc4a;
      font-size: 1rem;
      margin-top: 4px;
    }

    /* Leaderboard Container */
    .qb-leaderboard-container {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 16px;
      padding: 16px;
    }

    .qb-section-title {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      color: rgba(255, 255, 255, 0.7);
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 16px;
    }

    .qb-section-title ion-icon {
      font-size: 1rem;
      color: #ffcc00;
    }

    .qb-players {
      display: flex;
      flex-direction: column;
      gap: 8px;
      max-height: 280px;
      overflow-y: auto;
      padding: 4px;
    }

    .qb-player-row {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.05);
      transition: all 0.2s ease;
      animation: pop 0.3s ease;
    }

    .qb-player-row:hover {
      background: rgba(255, 255, 255, 0.1);
      transform: translateX(4px);
    }

    .qb-player-row.top {
      background: linear-gradient(135deg, rgba(255, 204, 0, 0.2), rgba(255, 204, 0, 0.05));
      border: 1px solid rgba(255, 204, 0, 0.3);
    }

    .qb-player-row.top-three {
      font-weight: 700;
    }

    @keyframes pop {
      from {
        transform: translateX(-8px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    .qb-rank {
      width: 36px;
      font-size: 1.1rem;
      font-weight: 900;
      text-align: center;
    }

    .qb-alias {
      flex: 1;
      color: white;
      font-weight: 600;
      font-size: 0.9rem;
    }

    .qb-delta {
      color: #6ddc4a;
      font-weight: 900;
      font-size: 0.85rem;
      padding: 2px 8px;
      background: rgba(109, 220, 74, 0.1);
      border-radius: 20px;
    }

    .qb-total {
      color: #ffcc00;
      font-weight: 900;
      font-size: 0.9rem;
      min-width: 70px;
      text-align: right;
    }

    .qb-empty {
      text-align: center;
      color: rgba(255, 255, 255, 0.4);
      padding: 20px;
      font-size: 0.85rem;
    }

    /* Next Button */
    .qb-next-btn {
      width: 100%;
      padding: 16px;
      border: none;
      border-radius: 16px;
      background: linear-gradient(135deg, #ffcc00 0%, #ffb700 100%);
      color: #111;
      font-weight: 900;
      font-size: 1.1rem;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      transition: all 0.2s ease;
    }

    .qb-next-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
    }

    .qb-next-btn:active {
      transform: translateY(2px);
    }

    .qb-next-btn ion-icon {
      font-size: 1.2rem;
    }

    /* Waiting State */
    .qb-waiting {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      text-align: center;
      color: rgba(255, 255, 255, 0.6);
      font-weight: 600;
      padding: 16px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 16px;
    }

    .qb-waiting ion-icon {
      font-size: 1.2rem;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }

    /* Scrollbar Styling */
    .qb-players::-webkit-scrollbar {
      width: 6px;
    }

    .qb-players::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 10px;
    }

    .qb-players::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.3);
      border-radius: 10px;
    }

    .qb-players::-webkit-scrollbar-thumb:hover {
      background: rgba(255, 255, 255, 0.5);
    }

    /* Responsive Design */
    @media (max-width: 480px) {
      .qb-card {
        padding: 16px;
        gap: 16px;
      }

      .qb-question {
        padding: 16px;
        font-size: 1rem;
      }

      .qb-histogram {
        gap: 8px;
        height: 180px;
      }

      .qb-bar-text {
        font-size: 0.6rem;
      }

      .qb-player-row {
        padding: 10px 12px;
      }

      .qb-rank {
        width: 30px;
        font-size: 0.9rem;
      }

      .qb-alias {
        font-size: 0.85rem;
      }

      .qb-total {
        font-size: 0.85rem;
        min-width: 60px;
      }
    }
  `]
})
export class QuestionBoardComponent {
  question = input.required<Question>();
  scores = input.required<PlayerScore[]>();
  answers = input.required<any[]>();
  players = input.required<{ uid: string; alias: string }[]>();
  isAdmin = input.required<boolean>();
  isLast = input.required<boolean>();
  onNext = output<void>();

  constructor() {
    addIcons({ checkmarkCircleOutline, arrowForwardOutline, trophyOutline, triangle, star, ellipse, square });
  }

  choiceCount = computed(() => {
    const counts = this.question().choices.map((_, i) =>
      this.answers().filter(a => a.choiceIndex === i).length
    );
    return counts;
  });

  barHeight = computed(() => {
    const counts = this.choiceCount();
    const max = Math.max(...counts, 1);
    return counts.map(c => Math.max(5, Math.round((c / max) * 100)));
  });

  sortedScores = computed(() =>
    [...this.scores()].sort((a, b) => b.totalScore - a.totalScore)
  );

  correctCount = computed(() =>
    this.answers().filter(a => a.choiceIndex === this.question().correctChoiceIndex).length
  );

  wrongCount = computed(() => this.players().length - this.correctCount());
}