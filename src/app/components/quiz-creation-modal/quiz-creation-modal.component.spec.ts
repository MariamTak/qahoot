import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { provideRouter } from '@angular/router';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { environment } from '../../../environments/environment';
import { CreateQuizModal} from './quiz-creation-modal.component';
import { testProviders } from 'src/test-utils/firebase-test.providers';

describe('CreateQuizModalComponent', () => {
  let component: CreateQuizModal;
  let fixture: ComponentFixture<CreateQuizModal>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ CreateQuizModal ],
      providers: testProviders
    }).compileComponents();

    fixture = TestBed.createComponent(CreateQuizModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
