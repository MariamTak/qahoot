import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AlertController, ToastController, ModalController } from '@ionic/angular/standalone';
import {
  IonContent, IonFooter, IonIcon, IonSpinner, IonButton
} from '@ionic/angular/standalone';
import { QuizService } from '../services/quiz';
import { PageHeader } from '../components/page-header/page-header.component';
import { PageFooter } from '../components/page-footer/page-footer.component';
import { QuizUpdateModalComponent } from '../components/quiz-update-modal/quiz-update-modal.component';
import { Quiz } from '../models/quiz';
import { addIcons } from 'ionicons';
import { createOutline, checkmarkCircleOutline, trashOutline } from 'ionicons/icons';

@Component({
  selector: 'app-quiz-detail',
  standalone: true,
  imports: [
    CommonModule, IonContent, IonFooter,
    IonIcon, IonSpinner, PageFooter, PageHeader, IonButton,
  ],
  template: `
    <page-header [translucent]="true">Quiz Details</page-header>

    <ion-content [fullscreen]="true">
      <div class="kh-page">

        @if (isLoading()) {
          <div class="kh-loading">
            <ion-spinner name="crescent" class="kh-spinner-main"></ion-spinner>
            <p>Loading quiz…</p>
          </div>
        } @else {
          @if (quiz(); as quiz) {

            <div class="kh-quiz-card">
              <div class="kh-quiz-title">{{ quiz.title }}</div>
              <div class="kh-quiz-desc">{{ quiz.description }}</div>
              <div class="kh-quiz-meta">{{ quiz.questions.length }} questions</div>
              <button class="kh-update-btn" (click)="openUpdateModal(quiz)">
                <ion-icon name="create-outline"></ion-icon>
                Update Quiz
              </button>
              <ion-button color="danger" expand="block" (click)="deleteQuiz(quiz.id)">
                <ion-icon name="trash-outline" slot="start"></ion-icon>
                Delete Quiz
              </ion-button>
            </div>

            @if (quiz.questions.length) {
              <div class="kh-questions-list">
                @for (question of quiz.questions; track question.id; let qi = $index) {
                  <div class="kh-question-block">

                    <div class="kh-question-header">
                      <span class="kh-q-num">Q{{ qi + 1 }}</span>
                      <span class="kh-q-text">{{ question.text }}</span>
                    </div>

                    @if (question.imageUrl) {
                      <img [src]="question.imageUrl" class="kh-q-image" />
                    }

                    <div class="kh-choices-grid">
                      @for (choice of question.choices; track choice.id; let ci = $index) {
                        <div class="kh-choice" [class.correct]="choice.id === question.correctChoiceIndex">
                          <span class="kh-choice-shape">
                            @switch (ci) {
                              @case (0) { <span class="shape triangle"></span> }
                              @case (1) { <span class="shape diamond"></span> }
                              @case (2) { <span class="shape circle"></span> }
                              @case (3) { <span class="shape square"></span> }
                            }
                          </span>
                          <span class="kh-choice-text">{{ choice.text }}</span>
                          @if (choice.id === question.correctChoiceIndex) {
                            <ion-icon name="checkmark-circle-outline" class="kh-correct-icon"></ion-icon>
                          }
                        </div>
                      }
                    </div>

                  </div>
                }
              </div>
            } @else {
              <div class="kh-empty-state">
                <p class="kh-empty-title">No questions yet</p>
                <p class="kh-empty-sub">Update the quiz to add questions</p>
              </div>
            }

          } @else {
            <div class="kh-empty-state">
              <p class="kh-empty-title">Quiz not found</p>
            </div>
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
      --kh-radius: 12px;
      --kh-font: 'Nunito', sans-serif;
      --A: #e84040; --B: #1368ce; --C: #d89e00; --D: #26890c;
    }

    ion-content { --background: var(--kh-purple); }

    .kh-page {
      min-height: 100vh;
      background: var(--kh-purple);
      background-image:
        radial-gradient(circle at 15% 15%, rgba(255,255,255,0.07) 0%, transparent 45%),
        radial-gradient(circle at 85% 85%, rgba(255,255,255,0.04) 0%, transparent 45%);
      display: flex; flex-direction: column; align-items: center;
      padding: 24px 20px 100px; gap: 16px;
      font-family: var(--kh-font);
    }

    .kh-loading {
      display: flex; flex-direction: column; align-items: center;
      gap: 16px; margin-top: 40%; color: rgba(255,255,255,0.7);
    }
    .kh-spinner-main { --color: var(--kh-yellow); width: 40px; height: 40px; }

    .kh-quiz-card {
      width: 100%; max-width: 480px;
      background: white; border-radius: 20px; padding: 24px;
      box-shadow: 0 8px 0 rgba(0,0,0,0.25);
      display: flex; flex-direction: column; gap: 8px;
    }
    .kh-quiz-title { font-size: 1.4rem; font-weight: 900; color: var(--kh-purple); }
    .kh-quiz-desc { font-size: 0.9rem; color: #666; }
    .kh-quiz-meta {
      font-size: 0.75rem; font-weight: 700;
      color: rgba(70,23,143,0.5);
      text-transform: uppercase; letter-spacing: 0.5px;
    }
    .kh-update-btn {
      margin-top: 8px; padding: 12px 20px; border: none;
      border-radius: var(--kh-radius);
      background: var(--kh-yellow); color: #111;
      font-family: var(--kh-font); font-weight: 900; font-size: 0.95rem;
      cursor: pointer; box-shadow: 0 4px 0 var(--kh-yellow-dark);
      display: flex; align-items: center; justify-content: center; gap: 8px;
      transition: transform 0.1s, box-shadow 0.1s;
    }
    .kh-update-btn:active {
      transform: translateY(3px); box-shadow: 0 1px 0 var(--kh-yellow-dark);
    }
    .kh-update-btn ion-icon { font-size: 1.1rem; }

    .kh-questions-list {
      width: 100%; max-width: 480px;
      display: flex; flex-direction: column; gap: 14px;
    }
    .kh-question-block {
      background: rgba(255,255,255,0.1);
      border: 2px solid rgba(255,255,255,0.18);
      border-radius: 16px; overflow: hidden;
    }
    .kh-question-header {
      display: flex; align-items: flex-start; gap: 12px;
      padding: 16px; background: rgba(255,255,255,0.08);
      border-bottom: 1px solid rgba(255,255,255,0.12);
    }
    .kh-q-num {
      background: var(--kh-yellow); color: #111;
      font-weight: 900; font-size: 0.75rem;
      padding: 3px 10px; border-radius: 99px; flex-shrink: 0; margin-top: 2px;
    }
    .kh-q-text { color: white; font-weight: 700; font-size: 0.95rem; line-height: 1.4; }
    .kh-q-image { width: 100%; height: 160px; object-fit: cover; }

    .kh-choices-grid {
      display: grid; grid-template-columns: 1fr 1fr; gap: 1px;
      background: rgba(255,255,255,0.1);
    }
    .kh-choice {
      display: flex; align-items: center; gap: 10px;
      padding: 14px; background: rgba(255,255,255,0.06);
    }
    .kh-choice:nth-child(1) { background: color-mix(in srgb, var(--A) 80%, transparent); }
    .kh-choice:nth-child(2) { background: color-mix(in srgb, var(--B) 80%, transparent); }
    .kh-choice:nth-child(3) { background: color-mix(in srgb, var(--C) 80%, transparent); }
    .kh-choice:nth-child(4) { background: color-mix(in srgb, var(--D) 80%, transparent); }
    .kh-choice.correct { filter: brightness(1.2); outline: 2px solid white; }

    .kh-choice-shape {
      width: 28px; height: 28px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }

    .shape { display: block; }
    .triangle {
      width: 0; height: 0;
      border-left: 8px solid transparent;
      border-right: 8px solid transparent;
      border-bottom: 14px solid white;
    }
    .diamond { width: 13px; height: 13px; background: white; transform: rotate(45deg); }
    .circle  { width: 14px; height: 14px; background: white; border-radius: 50%; }
    .square  { width: 13px; height: 13px; background: white; }

    .kh-choice-text {
      color: white; font-size: 0.85rem; font-weight: 700;
      flex: 1; line-height: 1.3;
    }
    .kh-correct-icon { color: white; font-size: 1.1rem; flex-shrink: 0; }

    .kh-empty-state {
      display: flex; flex-direction: column; align-items: center;
      gap: 8px; margin-top: 48px; text-align: center;
    }
    .kh-empty-title { color: white; font-size: 1.1rem; font-weight: 900; margin: 0; }
    .kh-empty-sub { color: rgba(255,255,255,0.6); font-size: 0.9rem; margin: 0; }
  `],
})
export class QuizDetailPage {
  private readonly quizService = inject(QuizService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly modalCtrl = inject(ModalController);
  private readonly alertCtrl = inject(AlertController);
  private readonly toastCtrl = inject(ToastController);

  private readonly quizId = this.route.snapshot.paramMap.get('id');
  private readonly quiz$ = this.quizService.getById(this.quizId!);

  protected quiz = toSignal(this.quiz$, { initialValue: null });
  protected isLoading = signal(true);

  constructor() {
    addIcons({ createOutline, checkmarkCircleOutline, trashOutline });
    this.quiz$.subscribe({
      next: () => this.isLoading.set(false),
      error: () => this.isLoading.set(false),
    });
  }

  async deleteQuiz(id: string) {
    const alert = await this.alertCtrl.create({
      header: 'Delete Quiz',
      message: 'Are you sure you want to delete this quiz?',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          role: 'destructive',
          handler: async () => {
            try {
              await this.quizService.deleteQuiz(id);
              await this.showToast('Quiz deleted successfully');
              this.router.navigate(['/home']);
            } catch {
              await this.showToast('Failed to delete quiz');
            }
          },
        },
      ],
    });
    await alert.present();
  }

  async openUpdateModal(quiz: Quiz) {
    const modal = await this.modalCtrl.create({
      component: QuizUpdateModalComponent,
      componentProps: { quiz },
    });
    await modal.present();

    const { data, role } = await modal.onWillDismiss<Quiz>();
    if (role !== 'confirm' || !data) return;

    const alert = await this.alertCtrl.create({
      header: 'Update Quiz',
      message: 'Save changes to this quiz?',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Save',
          handler: async () => {
            try {
              const updatedQuiz: Quiz = {
                ...data,
                id: quiz.id,
                ownerId: quiz.ownerId,
              };
              await this.quizService.updateQuiz(updatedQuiz);
              await this.showToast('Quiz updated successfully');
            } catch {
              await this.showToast('Failed to update quiz');
            }
          },
        },
      ],
    });
    await alert.present();
  }

  private async showToast(message: string) {
    const toast = await this.toastCtrl.create({ message, duration: 1500 });
    await toast.present();
  }
}