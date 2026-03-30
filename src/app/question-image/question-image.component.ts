import { Component, input, output, inject } from '@angular/core';
import { IonButton, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { imageOutline, removeOutline } from 'ionicons/icons';
import { QuizService } from 'src/app/services/quiz';

@Component({
  selector: 'app-question-image',
  standalone: true,
  imports: [IonButton, IonIcon],
  template: `
    @if (imageUrl()) {
      <div style="position:relative; margin-top:10px;">
        <img
          [src]="imageUrl()"
          style="width:100%; height:160px; object-fit:cover; border-radius:10px;"
        />
        <ion-button
          fill="clear"
          size="small"
          style="position:absolute; top:4px; right:4px; --background:rgba(0,0,0,0.4); --color:#fff;"
          (click)="onRemove()">
          <ion-icon name="remove-outline"></ion-icon>
        </ion-button>
      </div>
    }

    <input
      type="file"
      accept="image/*"
      style="display:none;"
      [id]="'img-' + questionId()"
      (change)="onFileSelected($event)"
    />
    <ion-button expand="full" fill="outline" size="small" style="margin-top:8px;"
      (click)="triggerInput()">
      <ion-icon name="image-outline" slot="start"></ion-icon>
      {{ imageUrl() ? 'Change image' : 'Add image' }}
    </ion-button>
  `
})
export class QuestionImageComponent {
  private quizService = inject(QuizService);

  questionId = input.required<string>();
  imageUrl   = input<string | undefined>();
  imageUploaded = output<string>();
  imageRemoved  = output<void>();

  constructor() {
    addIcons({ imageOutline, removeOutline });
  }

  triggerInput() {
    const input = document.getElementById('img-' + this.questionId()) as HTMLInputElement;
    input.click();
  }

  async onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const url = await this.quizService.uploadQuestionImage(file, this.questionId());
    console.log('Image URL:', url); 
    this.imageUploaded.emit(url);
  }

  onRemove() {
    this.imageRemoved.emit();
  }
}