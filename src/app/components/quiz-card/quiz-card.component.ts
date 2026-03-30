import { Component, input, inject, signal } from '@angular/core';
import { IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { Quiz } from 'src/app/models/quiz';
import { RouterLink, Router } from '@angular/router';
import { TitleCasePipe } from '@angular/common';
import { playOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { GameService } from 'src/app/services/game';

@Component({
  selector: 'quiz-card',
  template: `
    @let quiz = this.quiz();
    <div class="kh-quiz-card" [routerLink]="'/quiz-detail/' + quiz.id">
      <div class="kh-quiz-info">
        <div class="kh-quiz-title">{{ quiz.title | titlecase }}</div>
        <div class="kh-quiz-sub">{{ quiz.questionsCount }} questions</div>
        <div class="kh-quiz-desc">{{ quiz.description }}</div>
      </div>
      <button
        class="kh-play-btn"
        [disabled]="loading()"
        (click)="createGame($event)"
      >
        @if (loading()) {
          <ion-spinner name="crescent" class="kh-play-spinner"></ion-spinner>
        } @else {
          <ion-icon name="play-outline"></ion-icon>
        }
      </button>
    </div>
  `,
  styles: [`
    :host {
      --kh-purple: #46178f;
      --kh-yellow: #ffcc00;
      --kh-yellow-dark: #e6b800;
      --kh-font: 'Nunito', sans-serif;
    }

    .kh-quiz-card {
      display: flex; align-items: center; justify-content: space-between;
      gap: 16px;
      background: white;
      border-radius: 16px;
      padding: 18px 16px 18px 20px;
      box-shadow: 0 6px 0 rgba(0,0,0,0.25);
      cursor: pointer;
      font-family: var(--kh-font);
      transition: transform 0.1s, box-shadow 0.1s;
    }
    .kh-quiz-card:active {
      transform: translateY(3px);
      box-shadow: 0 3px 0 rgba(0,0,0,0.25);
    }

    .kh-quiz-info {
      display: flex; flex-direction: column; gap: 4px;
      flex: 1; overflow: hidden;
    }
    .kh-quiz-title {
      font-size: 1rem; font-weight: 900;
      color: var(--kh-purple);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .kh-quiz-sub {
      font-size: 0.75rem; font-weight: 700;
      color: rgba(70,23,143,0.5);
      text-transform: uppercase; letter-spacing: 0.5px;
    }
    .kh-quiz-desc {
      font-size: 0.85rem; color: #666;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      margin-top: 2px;
    }

    .kh-play-btn {
      width: 48px; height: 48px; border-radius: 50%;
      border: none; flex-shrink: 0;
      background: var(--kh-yellow);
      color: #111;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 4px 0 var(--kh-yellow-dark);
      cursor: pointer;
      transition: transform 0.1s, box-shadow 0.1s;
      font-size: 1.3rem;
    }
    .kh-play-btn:active:not([disabled]) {
      transform: translateY(3px);
      box-shadow: 0 1px 0 var(--kh-yellow-dark);
    }
    .kh-play-btn[disabled] { opacity: 0.5; cursor: not-allowed; }
    .kh-play-spinner { --color: #111; width: 20px; height: 20px; }
  `],
  imports: [IonIcon, IonSpinner, RouterLink, TitleCasePipe],
})
export class QuizCard {
  readonly quiz = input.required<Quiz>();
  private router = inject(Router);
  private gameService = inject(GameService);
  loading = signal(false);

  constructor() {
    addIcons({ playOutline });
  }

  async createGame(event: MouseEvent) {
    event.stopPropagation();
    event.preventDefault();
    this.loading.set(true);
    try {
      const gameId = await this.gameService.createGame(this.quiz().id);
      this.router.navigate(['/game-lobby', gameId]);
    } catch (err) {
      console.error('Impossible de créer le game', err);
    } finally {
      this.loading.set(false);
    }
  }
}