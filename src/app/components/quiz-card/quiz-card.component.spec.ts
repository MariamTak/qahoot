import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { QuizCard } from './quiz-card.component';
import { testProviders } from 'src/test-utils/firebase-test.providers';

describe('QuizCardComponent', () => {
  let component: QuizCard;
  let fixture: ComponentFixture<QuizCard>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ QuizCard ],
providers: testProviders
    }).compileComponents();

    fixture = TestBed.createComponent(QuizCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
