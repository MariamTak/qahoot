import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { ModalController } from '@ionic/angular/standalone';
import { provideRouter } from '@angular/router';
import { environment } from 'src/environments/environment';

export const testProviders = [
  provideRouter([]),
  provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
  provideAuth(() => getAuth()),
  provideFirestore(() => getFirestore()),
  ModalController,
];