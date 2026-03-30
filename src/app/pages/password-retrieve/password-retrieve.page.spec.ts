import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PasswordRetrievePage } from './password-retrieve.page';

describe('PasswordRetrievePage', () => {
  let component: PasswordRetrievePage;
  let fixture: ComponentFixture<PasswordRetrievePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PasswordRetrievePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
