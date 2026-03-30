import { Component, inject, Input, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { QuestionImageComponent } from 'src/app/question-image/question-image.component';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
  IonContent, IonItem, IonInput, IonTextarea, ModalController,
  IonRow, IonCol, IonRadio, IonRadioGroup, IonIcon,
} from '@ionic/angular/standalone';
import { Quiz } from 'src/app/models/quiz';
import { QuizService } from 'src/app/services/quiz';
import { addIcons } from 'ionicons';
import { removeOutline, addOutline } from 'ionicons/icons';

@Component({
  selector: 'app-quiz-update-modal',
  standalone: true,
  template: `
@if (isReady()) {
  <form [formGroup]="quizForm" (ngSubmit)="confirm()" id="updateQuizForm" novalidate>

    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button (click)="cancel()">Cancel</ion-button>
        </ion-buttons>
        <ion-title>Update Quiz</ion-title>
        <ion-buttons slot="end">
          <ion-button type="submit" form="updateQuizForm" [strong]="true" [disabled]="quizForm.invalid">
            Update
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true">
      <div class="kh-page">

        <!-- Quiz info -->
        <div class="kh-section">
          <div class="kh-section-label">Quiz Info</div>
          <div class="kh-field-card">

            <div class="kh-field-wrapper">
              <label class="kh-field-label">Title</label>
              <ion-item lines="none" class="kh-item kh-info-item">
                <ion-input
                  formControlName="title"
                  placeholder="Enter quiz title"
                  class="kh-input"
                ></ion-input>
              </ion-item>
            </div>

            <div class="kh-divider"></div>

            <div class="kh-field-wrapper">
              <label class="kh-field-label">Description</label>
              <ion-item lines="none" class="kh-item kh-info-item">
                <ion-textarea
                  formControlName="description"
                  placeholder="Enter quiz description"
                  [rows]="3"
                  class="kh-input"
                ></ion-textarea>
              </ion-item>
            </div>

          </div>
        </div>

        <!-- Questions -->
        <div class="kh-section">
          <div class="kh-section-label">Questions</div>

          <ion-row formArrayName="questions">
            @for (question of questionsArray.controls; track $index; let qi = $index) {
              <ion-col size="12" [formGroupName]="qi">
                <div class="kh-question-card">

                  <!-- Question header -->
                  <div class="kh-question-header">
                    <span class="kh-q-badge">Q{{ qi + 1 }}</span>
                    <ion-item lines="none" class="kh-item kh-question-input">
                      <ion-input
                        formControlName="text"
                        placeholder="Enter question text"
                        class="kh-input"
                      ></ion-input>
                    </ion-item>
                    <button type="button" class="kh-remove-btn" (click)="removeQuestion(qi)">
                      <ion-icon name="remove-outline"></ion-icon>
                    </button>
                  </div>

                  <!-- Image upload -->
                  <div class="kh-image-section">
                    <app-question-image
                      [questionId]="questionsArray.at(qi).get('id')?.value"
                      [imageUrl]="questionsArray.at(qi).get('imageUrl')?.value"
                      (imageUploaded)="onImageUploaded($event, qi)"
                      (imageRemoved)="onImageRemoved(qi)"
                    />
                  </div>

                  <!-- Choices -->
                  <div class="kh-choices-section">
                    <div class="kh-choices-label">
                      <span>Choices</span>
                      <span class="kh-correct-hint">Tap circle = correct</span>
                    </div>
                    <ion-radio-group formControlName="correctChoiceIndex">
                      <div formArrayName="choices" class="kh-choices-grid">
                        @for (choice of getChoices(qi).controls; track $index; let ci = $index) {
                          <div class="kh-choice-row kh-choice-{{ ci }}" [formGroupName]="ci">
                            <span class="kh-choice-shape">
                              @switch (ci) {
                                @case (0) { <span class="shape triangle"></span> }
                                @case (1) { <span class="shape diamond"></span> }
                                @case (2) { <span class="shape circle"></span> }
                                @case (3) { <span class="shape square"></span> }
                              }
                            </span>
                            <ion-item lines="none" class="kh-item kh-choice-input">
                              <ion-input
                                formControlName="text"
                                placeholder="Choice {{ ci + 1 }}"
                                class="kh-input"
                              ></ion-input>
                            </ion-item>
                            <ion-radio [value]="ci" class="kh-radio"></ion-radio>
                            <button type="button" class="kh-remove-sm" (click)="removeChoice(qi, ci)">
                              <ion-icon name="remove-outline"></ion-icon>
                            </button>
                          </div>
                        }
                      </div>
                    </ion-radio-group>

                    <button type="button" class="kh-add-choice-btn" (click)="addChoice(qi)">
                      <ion-icon name="add-outline"></ion-icon>
                      Add choice
                    </button>
                  </div>

                </div>
              </ion-col>
            }
          </ion-row>

          <button type="button" class="kh-add-question-btn" (click)="addQuestion()">
            <ion-icon name="add-outline"></ion-icon>
            Add Question
          </button>
        </div>

      </div>
    </ion-content>

  </form>
}
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
    ion-toolbar { --background: var(--kh-purple); --color: white; }

    .kh-page {
      min-height: 100vh;
      background: var(--kh-purple);
      background-image:
        radial-gradient(circle at 15% 15%, rgba(255,255,255,0.07) 0%, transparent 45%),
        radial-gradient(circle at 85% 85%, rgba(255,255,255,0.04) 0%, transparent 45%);
      display: flex; flex-direction: column;
      padding: 24px 16px 100px; gap: 20px;
      font-family: var(--kh-font);
    }

    /* Section */
    .kh-section {
      display: flex; flex-direction: column; gap: 12px;
    }
    .kh-section-label {
      color: rgba(255,255,255,0.6); font-size: 0.75rem;
      font-weight: 800; text-transform: uppercase; letter-spacing: 1px;
      padding-left: 4px;
    }

    /* Quiz Info field card */
    .kh-field-card {
      background: rgba(255,255,255,0.1);
      border: 2px solid rgba(255,255,255,0.2);
      border-radius: 16px;
      overflow: hidden;
    }

    .kh-field-wrapper {
      padding: 12px 14px;
    }

    .kh-field-label {
      display: block;
      font-size: 0.7rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: rgba(255,255,255,0.5);
      margin-bottom: 6px;
      font-family: var(--kh-font);
    }

    .kh-info-item {
      --background: rgba(255,255,255,0.08);
      --color: white;
      --placeholder-color: rgba(255,255,255,0.35);
      --border-radius: 10px;
      --padding-start: 12px;
      border-radius: 10px;
      border: 1px solid rgba(255,255,255,0.15);
    }

    /* Force white text inside Ionic shadow DOM */
    ::ng-deep .kh-info-item input,
    ::ng-deep .kh-info-item textarea {
      color: white !important;
      caret-color: white !important;
    }

    ::ng-deep .kh-info-item .native-input,
    ::ng-deep .kh-info-item .native-textarea {
      color: white !important;
      caret-color: white !important;
    }

    .kh-divider {
      height: 1px;
      background: rgba(255,255,255,0.12);
      margin: 0 14px;
    }

    /* Items */
    .kh-item {
      --background: transparent;
      --color: #333;
      --padding-start: 0;
    }
    .kh-input { font-family: var(--kh-font); }

    /* Question card */
    .kh-question-card {
      background: rgba(255,255,255,0.1);
      border: 2px solid rgba(255,255,255,0.2);
      border-radius: 16px; overflow: hidden;
      margin-bottom: 4px;
    }

    .kh-question-header {
      display: flex; align-items: center; gap: 10px;
      padding: 12px 14px; background: rgba(255,255,255,0.08);
      border-bottom: 1px solid rgba(255,255,255,0.12);
    }
    .kh-q-badge {
      background: var(--kh-yellow); color: #111;
      font-size: 0.72rem; font-weight: 900;
      padding: 3px 10px; border-radius: 99px; flex-shrink: 0;
    }
    .kh-question-input { flex: 1; --color: white; }
    .kh-remove-btn {
      width: 32px; height: 32px; border-radius: 50%; border: none;
      background: rgba(255,255,255,0.15); color: white;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; flex-shrink: 0; font-size: 1rem;
    }

    /* Image section */
    .kh-image-section {
      padding: 10px 14px;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }

    /* Choices */
    .kh-choices-section {
      padding: 12px 14px;
      display: flex; flex-direction: column; gap: 8px;
    }
    .kh-choices-label {
      display: flex; justify-content: space-between; align-items: center;
      font-size: 0.75rem; font-weight: 800;
      color: rgba(255,255,255,0.6); text-transform: uppercase; letter-spacing: 0.5px;
    }
    .kh-correct-hint { font-weight: 600; text-transform: none; letter-spacing: 0; }

    .kh-choices-grid {
      display: flex; flex-direction: column; gap: 6px;
    }
    .kh-choice-row {
      display: flex; align-items: center; gap: 8px;
      padding: 10px 12px; border-radius: 10px;
    }
    .kh-choice-0 { background: color-mix(in srgb, var(--A) 70%, transparent); }
    .kh-choice-1 { background: color-mix(in srgb, var(--B) 70%, transparent); }
    .kh-choice-2 { background: color-mix(in srgb, var(--C) 70%, transparent); }
    .kh-choice-3 { background: color-mix(in srgb, var(--D) 70%, transparent); }

    .kh-choice-input { flex: 1; --color: white; --placeholder-color: rgba(255,255,255,0.5); }
    .kh-radio { --color: white; --color-checked: white; flex-shrink: 0; }
    .kh-remove-sm {
      width: 26px; height: 26px; border-radius: 50%; border: none;
      background: rgba(0,0,0,0.2); color: white;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; flex-shrink: 0; font-size: 0.85rem;
    }

    /* Shapes */
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
    .circle { width: 14px; height: 14px; background: white; border-radius: 50%; }
    .square { width: 13px; height: 13px; background: white; }

    /* Add choice button */
    .kh-add-choice-btn {
      padding: 10px 16px; border: 2px dashed rgba(255,255,255,0.3);
      border-radius: 10px; background: transparent; color: rgba(255,255,255,0.7);
      font-family: var(--kh-font); font-weight: 700; font-size: 0.88rem;
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      gap: 6px; transition: border-color 0.15s, color 0.15s;
    }
    .kh-add-choice-btn:active { border-color: white; color: white; }

    /* Add question button */
    .kh-add-question-btn {
      width: 100%; padding: 16px; border: none;
      border-radius: var(--kh-radius);
      background: var(--kh-yellow); color: #111;
      font-family: var(--kh-font); font-weight: 900; font-size: 1rem;
      cursor: pointer; box-shadow: 0 5px 0 var(--kh-yellow-dark);
      display: flex; align-items: center; justify-content: center; gap: 8px;
      transition: transform 0.1s, box-shadow 0.1s;
    }
    .kh-add-question-btn:active {
      transform: translateY(3px); box-shadow: 0 2px 0 var(--kh-yellow-dark);
    }
  `],
  imports: [
    ReactiveFormsModule,
    IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
    IonContent, IonItem, IonInput, IonTextarea,
    IonRow, IonCol, IonRadio, IonRadioGroup, IonIcon,
    QuestionImageComponent
  ],
})
export class QuizUpdateModalComponent implements OnInit {
  private readonly modalCtrl = inject(ModalController);
  private readonly fb = inject(FormBuilder);
  private readonly q = inject(QuizService);

  constructor() {
    addIcons({ removeOutline, addOutline });
  }

  @Input() quiz!: Quiz;
  isReady = signal(false);
  quizForm!: FormGroup;

  get questionsArray(): FormArray {
    return this.quizForm.get('questions') as FormArray;
  }

  getChoices(questionIndex: number): FormArray {
    return this.questionsArray.at(questionIndex).get('choices') as FormArray;
  }

  addQuestion() {
    const newQuestionId = this.q.generateQuestionId(this.quiz.id);
    this.questionsArray.push(
      this.fb.group({
        id: [newQuestionId],
        text: ['', Validators.required],
        correctChoiceIndex: [0],
        choices: this.fb.array([this.fb.group({ text: ['', Validators.required] })])
      })
    );
  }

  ngOnInit() {
    this.quizForm = this.fb.group({
      id: [this.quiz.id],
      title: [this.quiz.title, Validators.required],
      description: [this.quiz.description],
      questions: this.fb.array(
        (this.quiz.questions ?? []).map(q =>
          this.fb.group({
            id: [q.id],
            text: [q.text, Validators.required],
            correctChoiceIndex: [q.correctChoiceIndex],
            imageUrl: [q.imageUrl ?? null],
            choices: this.fb.array(
              (q.choices ?? []).map(c =>
                this.fb.group({ text: [c.text, Validators.required] })
              )
            ),
          })
        )
      ),
    });
    this.isReady.set(true);
  }

  cancel() { this.modalCtrl.dismiss(null, 'cancel'); }
  confirm() {
    if (this.quizForm.invalid) return;
    this.modalCtrl.dismiss(this.quizForm.value, 'confirm');
  }
  removeQuestion(index: number) { this.questionsArray.removeAt(index); }
  addChoice(questionIndex: number) {
    this.getChoices(questionIndex).push(this.fb.group({ text: ['', Validators.required] }));
  }
  removeChoice(questionIndex: number, choiceIndex: number) {
    this.getChoices(questionIndex).removeAt(choiceIndex);
  }
  onImageUploaded(url: string, questionIndex: number) {
    this.questionsArray.at(questionIndex).patchValue({ imageUrl: url });
  }
  onImageRemoved(questionIndex: number) {
    this.questionsArray.at(questionIndex).patchValue({ imageUrl: null });
  }
}