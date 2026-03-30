import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { testProviders } from 'src/test-utils/firebase-test.providers';
import { PageHeader} from './page-header.component';

describe('PageHeaderComponent', () => {
  let component: PageHeader;
  let fixture: ComponentFixture<PageHeader>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ PageHeader ],
    providers: testProviders
    }).compileComponents();

    fixture = TestBed.createComponent(PageHeader);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
