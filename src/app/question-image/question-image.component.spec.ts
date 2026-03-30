import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { QuestionImageComponent } from './question-image.component';

describe('QuestionImageComponent', () => {
  let component: QuestionImageComponent;
  let fixture: ComponentFixture<QuestionImageComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ QuestionImageComponent ]    }).compileComponents();

    fixture = TestBed.createComponent(QuestionImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
