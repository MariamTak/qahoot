import { Component, inject, input, linkedSignal, signal } from '@angular/core';
import {
  applyEach,
  FormField,
  form,
  required,
  SchemaPathTree,
  validate,
} from '@angular/forms/signals';
import { QuestionImageComponent } from 'src/app/question-image/question-image.component';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonItem,
  IonInput,
  IonList,
  IonTextarea,
  ModalController,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonRadio,
  IonRadioGroup,
  IonLabel,
  IonIcon,
} from '@ionic/angular/standalone';
import { Quiz } from 'src/app/models/quiz';
import { Choice } from 'src/app/models/choice';
import { Question } from 'src/app/models/question';
import { addIcons } from 'ionicons';
import { removeOutline, checkmarkOutline } from 'ionicons/icons';
import { QuizService } from 'src/app/services/quiz';

function ChoiceSchema(choice: SchemaPathTree<Choice>) {
  required(choice.text, { message: 'Choice text is required' });
}

function QuestionSchema(question: SchemaPathTree<Question>) {
  required(question.text, { message: 'Question text is required' });
  validate(question.correctChoiceIndex, ({ value, valueOf }) => {
    if (!valueOf(question.choices)[value()]) {
      return {
        kind: 'no-correct-choice',
        message: 'At least one choice must be marked as correct',
      };
    }
    return null;
  });
  applyEach(question.choices, ChoiceSchema);
}

@Component({
  selector: 'create-quiz-modal',
  template: `
    <form id="createQuizForm" (submit)="confirm($event)" novalidate>

      <!-- ═══ HEADER ═══ -->
      <ion-header class="kh-modal-header">
        <ion-toolbar class="kh-toolbar">
          <ion-buttons slot="start">
            <ion-button class="kh-cancel-btn" (click)="cancel()" data-testid="cancel-create-quiz-button">
              ✕ Cancel
            </ion-button>
          </ion-buttons>

          <ion-title>
            <ion-input
              class="kh-title-input"
              aria-label="Enter the quiz title"
              [formField]="quizForm.title"
              placeholder="Quiz title…"
              type="text"
            ></ion-input>
          </ion-title>

          <ion-buttons slot="end">
            <ion-button
              class="kh-confirm-btn"
              data-testid="confirm-create-quiz-button"
              [strong]="true"
              [disabled]="quizForm().invalid()"
              (click)="confirm($event)"
            >
              ✓ Save
            </ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>

      <!-- ═══ CONTENT ═══ -->
      <ion-content class="kh-modal-content" [fullscreen]="true">
        <div class="kh-page">

          <!-- Description -->
          <div class="kh-description-card">
            <div class="kh-section-label">📝 Description</div>
            <ion-textarea
              class="kh-description-input"
              [formField]="quizForm.description"
              placeholder="Describe your quiz…"
              [autoGrow]="true"
            ></ion-textarea>
          </div>

          <!-- Questions -->
          <ion-grid class="kh-grid">
            <ion-row>
              @for (question of quizForm.questions; track $index; let qi = $index) {
                <ion-col size="12">
                  <div class="kh-question-card">

                    <!-- Question header -->
                    <div class="kh-question-header">
                      <div class="kh-q-badge">Q{{ qi + 1 }}</div>
                      <button type="button" class="kh-remove-question-btn"
                        (click)="removeQuestion(question().value().id)">
                        ✕ Remove
                      </button>
                    </div>

                    <!-- Question text -->
                    <ion-input
                      class="kh-question-input"
                      aria-label="Enter the question text"
                      [formField]="question.text"
                      placeholder="Type your question here…"
                    ></ion-input>

                    <!-- Image upload -->
                    <div class="kh-image-section">
                      <app-question-image
                        [questionId]="question().value().id"
                        [imageUrl]="question().value().imageUrl"
                        (imageUploaded)="onImageUploaded($event, question().value().id)"
                        (imageRemoved)="onImageRemoved(question().value().id)"
                      />
                    </div>

                    <!-- Divider -->
                    <div class="kh-divider"></div>

                    <!-- Choices -->
                    <div class="kh-choices-label">🎯 Choices — select the correct answer</div>
                    <ion-radio-group [formField]="question.correctChoiceIndex">
                      <div class="kh-choices-grid">
                        @for (choice of question.choices; track $index; let first = $first; let idx = $index) {
                          <div class="kh-choice-wrapper">
                            <div class="kh-choice-item"
                              [style]="'background:' + ['#E21B3C','#1368CE','#D89E00','#26890C'][idx % 4]">

                              <!-- Shape icon -->
                              @switch (idx % 4) {
                                @case (0) {
                                  <svg class="kh-shape" width="18" height="18" viewBox="0 0 16 16">
                                    <polygon points="8,1 15,15 1,15" fill="white"/>
                                  </svg>
                                }
                                @case (1) {
                                  <svg class="kh-shape" width="18" height="18" viewBox="0 0 16 16">
                                    <rect x="1" y="1" width="14" height="14" fill="white"/>
                                  </svg>
                                }
                                @case (2) {
                                  <svg class="kh-shape" width="18" height="18" viewBox="0 0 16 16">
                                    <circle cx="8" cy="8" r="7" fill="white"/>
                                  </svg>
                                }
                                @default {
                                  <svg class="kh-shape" width="18" height="18" viewBox="0 0 16 16">
                                    <polygon points="1,8 8,1 15,8 8,15" fill="white"/>
                                  </svg>
                                }
                              }

                              <!-- Input -->
                              <ion-input
                                class="kh-choice-input"
                                aria-label="Enter the choice text"
                                [formField]="choice.text"
                                placeholder="Choice {{ idx + 1 }}"
                              ></ion-input>

                              <!-- Radio (correct answer selector) -->
                              <ion-radio class="kh-radio" [value]="idx"></ion-radio>

                              <!-- Remove button (not on first) -->
                              @if (!first) {
                                <button type="button" class="kh-remove-choice-btn"
                                  (click)="removeChoice(question().value().id, idx)">
                                  <ion-icon name="remove-outline"></ion-icon>
                                </button>
                              } @else {
                                <span style="width:28px; flex-shrink:0;"></span>
                              }
                            </div>
                          </div>
                        }
                      </div>
                    </ion-radio-group>

                    <!-- Add choice -->
                    <button type="button" class="kh-add-choice-btn"
                      (click)="addChoice(question().value().id)">
                      + Add choice
                    </button>

                  </div>
                </ion-col>
              }
            </ion-row>
          </ion-grid>

          <!-- Add question -->
          <button type="button" class="kh-add-question-btn" (click)="addQuestion()">
            + Add question
          </button>

        </div>
      </ion-content>
    </form>
  `,
  styles: [`
    /* ── CSS Variables ── */
    :host {
      --kh-purple:      #46178f;
      --kh-purple-dark: #2d0f5e;
      --kh-purple-mid:  #5a2aa0;
      --kh-yellow:      #ffcc00;
      --kh-yellow-dark: #e6b800;
      --kh-radius:      14px;
      --kh-font:        'Nunito', sans-serif;
    }

    /* ── Toolbar ── */
    .kh-toolbar {
      --background: var(--kh-purple-dark);
      --border-color: transparent;
      --color: white;
    }

    .kh-cancel-btn {
      --color: rgba(255,255,255,0.7);
      font-family: var(--kh-font);
      font-weight: 700;
      font-size: 0.85rem;
      letter-spacing: 0.3px;
    }

    .kh-confirm-btn {
      --background: var(--kh-yellow);
      --color: #111;
      --border-radius: 99px;
      --padding-start: 18px;
      --padding-end: 18px;
      font-family: var(--kh-font);
      font-weight: 900;
      font-size: 0.85rem;
      box-shadow: 0 3px 0 var(--kh-yellow-dark);
    }
    .kh-confirm-btn[disabled] {
      --background: rgba(255,255,255,0.15);
      --color: rgba(255,255,255,0.4);
      box-shadow: none;
    }

    .kh-title-input {
      --color: white;
      --placeholder-color: rgba(255,255,255,0.45);
      font-family: var(--kh-font);
      font-weight: 800;
      font-size: 1rem;
      text-align: center;
    }

    /* ── Content background ── */
    .kh-modal-content {
      --background: var(--kh-purple);
    }

    .kh-page {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 20px 16px 60px;
      gap: 16px;
      font-family: var(--kh-font);
      background: var(--kh-purple);
      background-image:
        radial-gradient(circle at 10% 10%, rgba(255,255,255,0.06) 0%, transparent 50%),
        radial-gradient(circle at 90% 90%, rgba(255,255,255,0.04) 0%, transparent 50%);
      min-height: 100%;
    }

    /* ── Description card ── */
    .kh-description-card {
      width: 100%;
      max-width: 560px;
      background: rgba(255,255,255,0.10);
      border: 2px solid rgba(255,255,255,0.18);
      border-radius: var(--kh-radius);
      padding: 14px 16px;
    }

    .kh-section-label {
      color: var(--kh-yellow);
      font-size: 0.75rem;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      margin-bottom: 6px;
    }

    .kh-description-input {
      --color: white;
      --placeholder-color: rgba(255,255,255,0.40);
      --background: transparent;
      font-family: var(--kh-font);
      font-size: 0.95rem;
      width: 100%;
    }

    /* ── Grid ── */
    .kh-grid {
      width: 100%;
      max-width: 560px;
      padding: 0;
    }

    /* ── Question card ── */
    .kh-question-card {
      background: rgba(255,255,255,0.10);
      border: 2px solid rgba(255,255,255,0.20);
      border-radius: var(--kh-radius);
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .kh-question-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .kh-q-badge {
      background: var(--kh-yellow);
      color: #111;
      font-size: 0.75rem;
      font-weight: 900;
      padding: 4px 14px;
      border-radius: 99px;
      box-shadow: 0 3px 0 var(--kh-yellow-dark);
      letter-spacing: 0.5px;
    }

    .kh-remove-question-btn {
      background: rgba(226, 27, 60, 0.25);
      color: #ff6b8a;
      border: 1.5px solid rgba(226, 27, 60, 0.50);
      border-radius: 99px;
      padding: 4px 14px;
      font-family: var(--kh-font);
      font-weight: 700;
      font-size: 0.78rem;
      cursor: pointer;
      transition: background 0.15s;
    }
    .kh-remove-question-btn:hover {
      background: rgba(226, 27, 60, 0.40);
    }

    .kh-question-input {
      --color: white;
      --placeholder-color: rgba(255,255,255,0.40);
      --background: rgba(255,255,255,0.08);
      --border-radius: 10px;
      --padding-start: 14px;
      --padding-end: 14px;
      font-family: var(--kh-font);
      font-weight: 700;
      font-size: 1rem;
      border-radius: 10px;
    }

    /* ── Image section ── */
    .kh-image-section {
      width: 100%;
    }

    /* ── Divider ── */
    .kh-divider {
      height: 1.5px;
      background: rgba(255,255,255,0.15);
      border-radius: 99px;
    }

    /* ── Choices ── */
    .kh-choices-label {
      color: rgba(255,255,255,0.70);
      font-size: 0.75rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.6px;
    }

    .kh-choices-grid {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .kh-choice-wrapper {
      width: 100%;
    }

    .kh-choice-item {
      display: flex;
      align-items: center;
      gap: 10px;
      border-radius: 10px;
      padding: 10px 12px;
      box-shadow: 0 4px 0 rgba(0,0,0,0.25);
      transition: transform 0.1s;
    }
    .kh-choice-item:active {
      transform: translateY(2px);
      box-shadow: 0 2px 0 rgba(0,0,0,0.25);
    }

    .kh-shape {
      flex-shrink: 0;
    }

    .kh-choice-input {
      --color: white;
      --placeholder-color: rgba(255,255,255,0.60);
      --background: transparent;
      flex: 1;
      font-family: var(--kh-font);
      font-weight: 700;
      font-size: 0.95rem;
    }

    .kh-radio {
      --color: rgba(255,255,255,0.70);
      --color-checked: white;
      flex-shrink: 0;
    }

    .kh-remove-choice-btn {
      background: rgba(0,0,0,0.20);
      color: white;
      border: none;
      border-radius: 50%;
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      flex-shrink: 0;
      font-size: 1rem;
    }

    /* ── Add choice button ── */
    .kh-add-choice-btn {
      width: 100%;
      padding: 11px;
      background: rgba(255,255,255,0.08);
      color: white;
      border: 2px dashed rgba(255,255,255,0.30);
      border-radius: 10px;
      font-family: var(--kh-font);
      font-weight: 800;
      font-size: 0.90rem;
      cursor: pointer;
      letter-spacing: 0.3px;
      transition: background 0.15s;
    }
    .kh-add-choice-btn:hover {
      background: rgba(255,255,255,0.14);
    }

    /* ── Add question button ── */
    .kh-add-question-btn {
      width: 100%;
      max-width: 560px;
      padding: 16px;
      background: var(--kh-yellow);
      color: #111;
      border: none;
      border-radius: var(--kh-radius);
      font-family: var(--kh-font);
      font-weight: 900;
      font-size: 1rem;
      cursor: pointer;
      box-shadow: 0 5px 0 var(--kh-yellow-dark);
      transition: transform 0.1s, box-shadow 0.1s;
      letter-spacing: 0.3px;
    }
    .kh-add-question-btn:active {
      transform: translateY(3px);
      box-shadow: 0 2px 0 var(--kh-yellow-dark);
    }
  `],
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonContent,
    IonInput,
    FormField,
    IonTextarea,
    IonGrid,
    IonRow,
    IonCol,
    IonRadio,
    IonRadioGroup,
    IonIcon,
    QuestionImageComponent,
  ],
})
export class CreateQuizModal {
  private readonly modalCtrl = inject(ModalController);
  private readonly quizService = inject(QuizService);

  constructor() {
    addIcons({ removeOutline, checkmarkOutline });
  }

  quiz = input<Quiz>();
  _quiz = linkedSignal(() => this.quiz() ?? this.quizService.generateQuiz());

  quizForm = form(this._quiz, (schemaPath) => {
    required(schemaPath.title, { message: 'Title is required' });
    applyEach(schemaPath.questions, QuestionSchema);
  });

  addQuestion() {
    const newQuestionId = this.quizService.generateQuestionId(this._quiz().id);
    const newQuestion: Question = {
      id: newQuestionId,
      text: '',
      choices: [{ id: 0, text: '' }],
      correctChoiceIndex: 0,
    };
    this._quiz.update((q) => ({ ...q, questions: [...q.questions, newQuestion] }));
    this.quizForm().markAsDirty();
  }

  removeQuestion(questionId: string) {
    this._quiz.update((q) => ({
      ...q,
      questions: q.questions.filter((q) => q.id !== questionId),
    }));
    this.quizForm().markAsDirty();
  }

  addChoice(questionId: string) {
    this._quiz.update((q) => ({
      ...q,
      questions: q.questions.map((question) =>
        question.id === questionId
          ? { ...question, choices: [...question.choices, { id: question.choices.length, text: '' }] }
          : question
      ),
    }));
    this.quizForm().markAsDirty();
  }

  removeChoice(questionId: string, choiceIndex: number) {
    this._quiz.update((q) => ({
      ...q,
      questions: q.questions.map((question) => {
        if (question.id !== questionId) return question;
        const updatedChoices = question.choices.filter((_, i) => i !== choiceIndex);
        return {
          ...question,
          choices: updatedChoices,
          correctChoiceIndex:
            question.correctChoiceIndex === choiceIndex ? 0 : question.correctChoiceIndex,
        };
      }),
    }));
    this.quizForm().markAsDirty();
  }

  cancel() {
    this.modalCtrl.dismiss();
  }

  confirm(event: Event) {
    event.preventDefault();
    if (this.quizForm().invalid()) return;
    this.modalCtrl.dismiss(this.quizForm().value());
  }

  onImageUploaded(url: string, questionId: string) {
    this._quiz.update((q) => ({
      ...q,
      questions: q.questions.map((question) =>
        question.id === questionId ? { ...question, imageUrl: url } : question
      ),
    }));
    this.quizForm().markAsDirty();
  }

  onImageRemoved(questionId: string) {
    this._quiz.update((q) => ({
      ...q,
      questions: q.questions.map((question) =>
        question.id === questionId ? { ...question, imageUrl: undefined } : question
      ),
    }));
    this.quizForm().markAsDirty();
  }
}