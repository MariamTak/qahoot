import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  IonContent, IonFab, IonFabButton, IonIcon,
  IonFooter, ModalController, IonSpinner
} from '@ionic/angular/standalone';
import { QuizService } from '../services/quiz';
import { QuizCard } from '../components/quiz-card/quiz-card.component';
import { addIcons } from 'ionicons';
import { add } from 'ionicons/icons';
import { CreateQuizModal } from '../components/quiz-creation-modal/quiz-creation-modal.component';
import { PageFooter } from '../components/page-footer/page-footer.component';
import { PageHeader } from '../components/page-header/page-header.component';

@Component({
  selector: 'quiz-list',
  template: `
<page-header [translucent]="true"></page-header>
    <ion-content [fullscreen]="true">
      <div class="kh-page">

        <!-- Header -->
        <div class="kh-header">
          <div class="kh-host-badge">My Quizzes</div>
        </div>

        <!-- Live badge -->
        <div class="kh-live-badge">
          <span class="kh-pulse-ring"></span>
          <span class="kh-pulse-dot"></span>
          {{ quizzes().length }} quiz{{ quizzes().length !== 1 ? 'zes' : '' }} ready to play
        </div>

        <!-- Quiz list -->
        @if (isLoading()) {
          <div class="kh-loading">
            <ion-spinner name="crescent" class="kh-spinner-main"></ion-spinner>
            <p>Loading quizzes…</p>
          </div>
        } @else if (quizzes().length === 0) {
          <div class="kh-empty-state">
            <div class="kh-empty-icon">🎮</div>
            <p class="kh-empty-title">No quizzes yet</p>
            <p class="kh-empty-sub">Tap the + button to create your first one</p>
            <button class="kh-create-btn" (click)="openCreateQuizModal()">
              Create your first quiz
            </button>
          </div>
        } @else {
          <div class="kh-quiz-list">
            @for (quiz of quizzes(); track quiz.id) {
              <quiz-card [quiz]="quiz" />
            }
          </div>
        }

      </div>
    </ion-content>

    <!-- FAB -->
    <ion-fab slot="fixed" horizontal="end" vertical="bottom">
      <ion-fab-button class="kh-fab" (click)="openCreateQuizModal()">
        <ion-icon name="add"></ion-icon>
      </ion-fab-button>
    </ion-fab>

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
      --kh-radius: 12px;
      --kh-font: 'Nunito', sans-serif;
    }

    ion-content { --background: var(--kh-purple); }

    .kh-page {
      min-height: 100vh;
      background: var(--kh-purple);
      background-image:
        radial-gradient(circle at 15% 15%, rgba(255,255,255,0.07) 0%, transparent 45%),
        radial-gradient(circle at 85% 85%, rgba(255,255,255,0.04) 0%, transparent 45%);
      display: flex; flex-direction: column; align-items: center;
      padding: 52px 20px 100px; gap: 18px;
      font-family: var(--kh-font);
    }

    /* Header */
    .kh-header {
      display: flex; align-items: center; justify-content: space-between;
      width: 100%; max-width: 480px;
    }
  
    .kh-host-badge {
      background: var(--kh-yellow); color: #111;
      font-size: 0.7rem; font-weight: 900; padding: 4px 12px;
      border-radius: 99px; text-transform: uppercase; letter-spacing: 0.5px;
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

    /* Loading */
    .kh-loading {
      display: flex; flex-direction: column; align-items: center;
      gap: 16px; margin-top: 40%; color: rgba(255,255,255,0.7);
    }
    .kh-spinner-main { --color: var(--kh-yellow); width: 40px; height: 40px; }

    /* Empty state */
    .kh-empty-state {
      display: flex; flex-direction: column; align-items: center;
      gap: 12px; margin-top: 48px; text-align: center;
      width: 100%; max-width: 480px;
    }
    .kh-empty-icon { font-size: 3rem; }
    .kh-empty-title {
      color: white; font-size: 1.2rem; font-weight: 900; margin: 0;
    }
    .kh-empty-sub {
      color: rgba(255,255,255,0.6); font-size: 0.9rem; margin: 0;
    }
    .kh-create-btn {
      margin-top: 8px; padding: 14px 32px; border: none;
      border-radius: var(--kh-radius);
      background: var(--kh-yellow); color: #111;
      font-family: var(--kh-font); font-weight: 900; font-size: 1rem;
      cursor: pointer; box-shadow: 0 5px 0 var(--kh-yellow-dark);
      transition: transform 0.1s, box-shadow 0.1s;
    }
    .kh-create-btn:active {
      transform: translateY(3px); box-shadow: 0 2px 0 var(--kh-yellow-dark);
    }

    /* Quiz list */
    .kh-quiz-list {
      width: 100%; max-width: 480px;
      display: flex; flex-direction: column; gap: 14px;
    }

    /* FAB */
    .kh-fab {
      --background: var(--kh-yellow);
      --background-activated: var(--kh-yellow-dark);
      --color: #111;
      --box-shadow: 0 5px 0 var(--kh-yellow-dark);
    }
  `],
  imports: [
    IonContent, IonFab, IonFabButton, IonIcon,
    IonFooter, IonSpinner,
    QuizCard, PageFooter,
    PageHeader
],
})
export class HomePage {
  private readonly quizService = inject(QuizService);
  private readonly modalCtrl = inject(ModalController);

  private quizzes$ = this.quizService.getAll();
  protected quizzes = toSignal(this.quizzes$, { initialValue: [] });
  protected isLoading = signal(true);

  constructor() {
    addIcons({ add });
    this.quizzes$.subscribe({
      next: () => this.isLoading.set(false),
      error: () => this.isLoading.set(false),
    });
  }

  async openCreateQuizModal() {
    const modalRef = await this.modalCtrl.create({
      component: CreateQuizModal,
      cssClass: 'fullscreen-modal',
    });
    modalRef.present();
    const eventDetails = await modalRef.onDidDismiss();
    if (eventDetails.data) {
      try {
        await this.quizService.setQuiz(eventDetails.data);
        this.quizzes$ = this.quizService.getAll();
        this.quizzes = toSignal(this.quizzes$, { initialValue: [] });
      } catch (error) {
        console.error('Error creating quiz:', error);
      }
    }
  }
}