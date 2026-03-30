import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { firstValueFrom, filter } from 'rxjs';
import { GameService } from 'src/app/services/game';
import { QuizService } from 'src/app/services/quiz';
import { AuthService } from 'src/app/services/auth';
import { Game } from 'src/app/models/game';
import { Quiz } from 'src/app/models/quiz';
import { Question } from 'src/app/models/question';
import {
  IonContent, IonHeader, IonTitle, IonToolbar,
  IonIcon, IonSpinner
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { triangle, star, ellipse, square } from 'ionicons/icons';
import { arrowForwardOutline, trophyOutline, peopleOutline } from 'ionicons/icons';
import { PlayerScore } from 'src/app/models/player';
import { QuestionBoardComponent } from './question-board';
import { PageHeader } from 'src/app/components/page-header/page-header.component';
@Component({
  selector: 'app-game-play',
  standalone: true,
  imports: [IonContent, IonIcon, IonSpinner, QuestionBoardComponent, PageHeader],
  template: `

<page-header [translucent]="true"></page-header>


    <ion-content>
      <div class="kh-page">

        @if (!currentQuestion()) {
          <div class="kh-loading">
            <ion-spinner name="crescent" class="kh-spinner-main"></ion-spinner>
            <p>Loading question…</p>
          </div>
        } @else {

          <!-- Header row -->
          <div class="kh-header">
            <div class="kh-host-badge">
              {{ isAdmin() ? 'Host' : 'Player' }}
            </div>
          </div>

          <!-- Live badge -->
          <div class="kh-live-badge">
            <span class="kh-pulse-ring"></span>
            <span class="kh-pulse-dot"></span>
            Question {{ game()!.currentQuestionIndex + 1 }} of {{ quiz()!.questions.length }}
          </div>

          <!-- Timer -->
          <div class="kh-timer-wrap">
            <div class="kh-timer-track">
              <div
                class="kh-timer-fill"
                [style.width.%]="(timeLeft() / 30) * 100"
                [class.urgent]="timeLeft() <= 10"
              ></div>
            </div>
            <span class="kh-timer-label" [class.urgent]="timeLeft() <= 10">
              {{ timeLeft() }}s
            </span>
          </div>

          <!-- Question -->
          <div class="kh-question-card">
            <p class="kh-question-text">{{ currentQuestion()!.text }}</p>
             @if (currentQuestion()!.imageUrl) {
                          <img
                            [src]="currentQuestion()!.imageUrl"
                            style="width:100%; height:160px; object-fit:cover; border-radius:10px; margin: 8px 0;"
                          />
                        }
            
          </div>

          <!-- Choices -->
          <div class="kh-choices">
            @for (choice of currentQuestion()!.choices; track choice.id) {
              <button
                class="kh-choice-btn"
                [class.selected]="selectedChoice() === $index"
                [disabled]="timeLocked() || isAdmin()"
                (click)="submitAnswer($index)"
              >
              <span class="kh-choice-icon">
        <ion-icon [name]="['triangle', 'star', 'ellipse', 'square'][$index]"></ion-icon>
      </span>
                <span class="kh-choice-text">{{ choice.text }}</span>
              </button>
            }
          </div>


         @if (game()?.currentStatus === 'done') {
  <app-question-board
    [question]="currentQuestion()!"
    [scores]="scores()"
    [answers]="boardAnswers()"
    [players]="game()!.players"
    [isAdmin]="isAdmin()"
    [isLast]="isLastQuestion()"
    (onNext)="nextQuestion()"
  />
} @else if (isAdmin()) {
  <div class="kh-admin-bar">
    <div class="kh-players-card">
      <div class="kh-players-header">
        <ion-icon name="people-outline"></ion-icon>
        <span>Answers</span>
        <span class="kh-answers-count">{{ answersCount() }} / {{ game()!.players.length }}</span>
      </div>
    </div>
  </div>
}
        }
      </div>
    </ion-content>
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
      --A: #e84040;
      --B: #1368ce;
      --C: #d89e00;
      --D: #26890c;
    }

    ion-content { --background: var(--kh-purple); }
    ion-toolbar { --background: var(--kh-purple); --color: white; }

    .kh-page {
      min-height: 100vh;
      background: var(--kh-purple);
      background-image:
        radial-gradient(circle at 15% 15%, rgba(255,255,255,0.07) 0%, transparent 45%),
        radial-gradient(circle at 85% 85%, rgba(255,255,255,0.04) 0%, transparent 45%);
      display: flex; flex-direction: column; align-items: center;
      padding: 32px 20px 48px; gap: 18px;
      font-family: var(--kh-font);
    }

    .kh-loading {
      display: flex; flex-direction: column; align-items: center;
      gap: 16px; margin-top: 40%;
      color: rgba(255,255,255,0.7);
    }
    .kh-spinner-main { --color: var(--kh-yellow); width: 40px; height: 40px; }

    /* Header */
    .kh-header {
      display: flex; align-items: center; justify-content: space-between;
      width: 100%; max-width: 480px;
    }
    .kh-logo {
      font-size: 1.5rem; font-weight: 900; color: white;
      text-shadow: 0 3px 0 rgba(0,0,0,0.3);
    }
    .kh-host-badge {
      background: var(--kh-yellow); color: #111;
      font-size: 0.7rem; font-weight: 900;
      padding: 4px 12px; border-radius: 99px;
      text-transform: uppercase; letter-spacing: 0.5px;
      box-shadow: 0 3px 0 var(--kh-yellow-dark);
    }

    /* Live badge */
    .kh-live-badge {
      position: relative; display: flex; align-items: center; gap: 12px;
      background: rgba(255,255,255,0.12);
      border: 2px solid rgba(255,255,255,0.25);
      border-radius: 99px; padding: 10px 22px 10px 18px;
      color: white; font-weight: 800; font-size: 0.92rem;
    }
    .kh-pulse-ring {
      width: 14px; height: 14px; border-radius: 50%;
      border: 2px solid var(--kh-yellow);
      animation: kh-pulse 1.5s ease-out infinite; flex-shrink: 0;
    }
    .kh-pulse-dot {
      position: absolute; left: 20px;
      width: 8px; height: 8px; border-radius: 50%;
      background: var(--kh-yellow);
    }
    @keyframes kh-pulse {
      0%   { transform: scale(0.5); opacity: 1; }
      100% { transform: scale(1.8); opacity: 0; }
    }

    /* Timer */
    .kh-timer-wrap {
      width: 100%; max-width: 480px;
      display: flex; align-items: center; gap: 12px;
    }
    .kh-timer-track {
      flex: 1; height: 10px;
      background: rgba(255,255,255,0.2);
      border-radius: 99px; overflow: hidden;
    }
    .kh-timer-fill {
      height: 100%; border-radius: 99px;
      background: var(--kh-yellow);
      transition: width 1s linear, background 0.3s;
    }
    .kh-timer-fill.urgent { background: #e84040; }
    .kh-timer-label {
      font-size: 13px; font-weight: 900;
      color: var(--kh-yellow); min-width: 28px; text-align: right;
    }
    .kh-timer-label.urgent { color: #e84040; }

    /* Question */
    .kh-question-card {
      width: 100%; max-width: 480px;
      background: white; border-radius: 20px; padding: 28px 24px;
      text-align: center;
      box-shadow: 0 8px 0 rgba(0,0,0,0.25), 0 12px 32px rgba(0,0,0,0.25);
    }
    .kh-question-text {
      font-size: 1.2rem; font-weight: 900;
      color: var(--kh-purple); margin: 0; line-height: 1.5;
    }

    /* Choices */
    .kh-choices {
      width: 100%; max-width: 480px;
      display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
    }
    .kh-choice-btn {
      display: flex; align-items: center; gap: 10px;
      padding: 18px 14px; border: none;
      border-radius: var(--kh-radius); cursor: pointer;
      font-family: var(--kh-font); font-size: 0.95rem; font-weight: 800;
      color: white; text-align: left;
      box-shadow: 0 5px 0 rgba(0,0,0,0.25);
      transition: transform 0.1s, box-shadow 0.1s;
    }
    .kh-choice-btn:nth-child(1) { background: var(--A); }
    .kh-choice-btn:nth-child(2) { background: var(--B); }
    .kh-choice-btn:nth-child(3) { background: var(--C); }
    .kh-choice-btn:nth-child(4) { background: var(--D); }
    .kh-choice-btn:active:not([disabled]) {
      transform: translateY(3px); box-shadow: 0 2px 0 rgba(0,0,0,0.25);
    }
    .kh-choice-btn[disabled] { opacity: 0.5; cursor: not-allowed; }
    .kh-choice-btn.selected {
      outline: 3px solid white;
      transform: translateY(3px); box-shadow: 0 2px 0 rgba(0,0,0,0.25);
    }
        .kh-choice-icon {
  width: 32px; height: 32px; 
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.1rem; flex-shrink: 0;
}

    .kh-waiting-banner {
      display: flex; align-items: center; gap: 12px;
      background: rgba(255,255,255,0.12);
      border: 2px solid rgba(255,255,255,0.2);
      border-radius: var(--kh-radius); padding: 16px 20px;
      width: 100%; max-width: 480px;
      color: white; font-weight: 800;
    }
    .kh-dots-spinner { --color: var(--kh-yellow); }

    /* Admin bar */
    .kh-admin-bar {
      width: 100%; max-width: 480px;
      display: flex; flex-direction: column; gap: 16px;
    }
    .kh-players-card {
      width: 100%; background: rgba(255,255,255,0.1);
      border: 2px solid rgba(255,255,255,0.18);
      border-radius: 16px; overflow: hidden;
    }
    .kh-players-header {
      display: flex; align-items: center; gap: 8px;
      padding: 12px 14px; background: rgba(255,255,255,0.1);
      color: white; font-weight: 800; font-size: 0.88rem;
      border-bottom: 1px solid rgba(255,255,255,0.12);
    }
    .kh-answers-count {
      margin-left: auto; color: var(--kh-yellow); font-weight: 900;
    }
    .kh-players-list {
      padding: 8px; display: flex; flex-direction: column;
      gap: 6px; max-height: 160px; overflow-y: auto;
    }
    .kh-empty {
      color: rgba(255,255,255,0.45); font-size: 0.85rem;
      text-align: center; padding: 20px 8px;
    }
    .kh-player-row {
      display: flex; align-items: center; gap: 8px;
      padding: 8px 10px; background: rgba(255,255,255,0.08);
      border-radius: 8px; animation: kh-pop-in 0.25s ease;
    }
    @keyframes kh-pop-in {
      from { transform: scale(0.85); opacity: 0; }
      to   { transform: scale(1); opacity: 1; }
    }
    .kh-avatar {
      width: 32px; height: 32px; border-radius: 50%;
      background: var(--kh-yellow); color: #111;
      font-weight: 900; font-size: 0.9rem;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 3px 0 var(--kh-yellow-dark);
    }
    .kh-player-name {
      color: white; font-weight: 700; font-size: 0.88rem;
      flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }

    /* Next button */
    .kh-next-btn {
      width: 100%; padding: 18px; border: none;
      border-radius: var(--kh-radius);
      background: var(--kh-yellow); color: #111;
      font-family: var(--kh-font); font-weight: 900; font-size: 1.3rem;
      cursor: pointer; box-shadow: 0 6px 0 var(--kh-yellow-dark);
      display: flex; align-items: center; justify-content: center; gap: 10px;
      transition: transform 0.1s, box-shadow 0.1s;
    }
    .kh-next-btn:active {
      transform: translateY(4px); box-shadow: 0 2px 0 var(--kh-yellow-dark);
    }
    .kh-next-btn ion-icon { font-size: 1.3rem; }
  `]
})


























export class GamePlayComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private gameService = inject(GameService);
  private quizService = inject(QuizService);
  private authService = inject(AuthService);
  scores = signal<PlayerScore[]>([]);
  private scoresSub!: Subscription;
  game = signal<Game | null>(null);
  quiz = signal<Quiz | null>(null);
  boardAnswers = signal<any[]>([]);

  selectedChoice = signal<number | null>(null);
  timeLocked = signal(false);
  isAdmin = signal(false);
  answers = signal<any[]>([]);
  timeLeft = signal(30);

  private timerInterval: any;

  currentQuestion = computed<Question | null>(() => {
    const q = this.quiz();
    const g = this.game();
    if (!q || !g) return null;
    return q.questions[g.currentQuestionIndex] ?? null;
  });

  isLastQuestion = computed(() => {
    const q = this.quiz();
    const g = this.game();
    if (!q || !g) return false;
    return g.currentQuestionIndex >= q.questions.length - 1;
  });

  answersCount = computed(() => this.answers().length);

  private gameId!: string;
  private sub!: Subscription;
  private answersSub!: Subscription;

  constructor() {
  addIcons({ arrowForwardOutline, trophyOutline, peopleOutline, triangle, star, ellipse, square });
  }

  async ngOnInit() {
    this.gameId = this.route.snapshot.paramMap.get('id')!;
    this.scoresSub = this.gameService.getScores(this.gameId).subscribe(s => this.scores.set(s));
    const user = await firstValueFrom(
      this.authService.getConnectedUser().pipe(filter(u => u !== null))
    );

    this.sub = this.gameService.getGame(this.gameId).subscribe(async (game) => {
      const prevIndex = this.game()?.currentQuestionIndex;
      this.game.set(game);
      this.isAdmin.set(user.uid === (game as any).adminId);

      if (!this.quiz()) {
        const quiz = await firstValueFrom(this.quizService.getById((game as any).refQuiz));
        this.quiz.set(quiz);
        this.startTimer();
      }

      if (prevIndex !== undefined && prevIndex !== game.currentQuestionIndex) {
        this.selectedChoice.set(null);
        this.timeLocked.set(false);
        this.subscribeToAnswers(game.currentQuestionIndex);
        this.startTimer();
      }

      if (game.status === 'finished') {
        this.router.navigate(['/game', this.gameId, 'results']);
      }
      if (game.currentStatus === 'done') {
        this.boardAnswers.set(this.answers());
      }
    });

    this.subscribeToAnswers(0);
  }

private startTimer() {
  clearInterval(this.timerInterval);
  this.timeLeft.set(30);
  this.timerInterval = setInterval(async () => {
    const current = this.timeLeft();
    
    if (current <= 1) {
      clearInterval(this.timerInterval);
      this.timeLeft.set(0);
      this.timeLocked.set(true);

      if (!this.isAdmin() && this.selectedChoice() === null) {
        await this.gameService.submitAnswer(
          this.gameId,
          this.game()!.currentQuestionIndex,
          -1
        );
      }
      if (this.isAdmin()) {
        // Wait a moment to ensure all answers are collected
        await new Promise(resolve => setTimeout(resolve, 2000));
        await this.gameService.showQuestionResults(
          this.gameId,
          this.game()!.currentQuestionIndex,
          this.currentQuestion()!.correctChoiceIndex,
          this.game()!.players
        );
      }
    } else {
      this.timeLeft.set(current - 1);

    }
  }, 1000);
}

  private subscribeToAnswers(questionIndex: number) {
    this.answersSub?.unsubscribe();
    this.answersSub = this.gameService
      .getAnswersForQuestion(this.gameId, questionIndex)
      .subscribe(a => this.answers.set(a));
  }
async submitAnswer(choiceIndex: number) {
  if (this.timeLocked() || this.isAdmin()) return;

  this.selectedChoice.set(choiceIndex);

  
    await this.gameService.submitAnswer(
      this.gameId,
      this.game()!.currentQuestionIndex,
      choiceIndex
    );
  
}
async nextQuestion() {
  this.boardAnswers.set([]);
  if (this.isLastQuestion()) {
    await this.gameService.endGame(this.gameId);
  } else {
    const nextIndex = this.game()!.currentQuestionIndex + 1;
    await this.gameService.goToNextQuestion(this.gameId, nextIndex);
    this.subscribeToAnswers(nextIndex);
  }
}

  ngOnDestroy() {
    this.sub?.unsubscribe();
    this.answersSub?.unsubscribe();
    clearInterval(this.timerInterval);
    this.scoresSub?.unsubscribe();
  }
}