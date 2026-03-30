import { inject, Injectable} from '@angular/core';
import {
  Auth,
  User,
  user,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithCredential,
  signInWithPopup,
} from '@angular/fire/auth';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { firstValueFrom } from 'rxjs';
import { UserService } from './user';
import { ToastController } from '@ionic/angular/standalone';
import { SocialLogin } from '@capgo/capacitor-social-login';
import { Capacitor } from '@capacitor/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private auth = inject(Auth);
  private router = inject(Router);
  private userService = inject(UserService);
  private toastController = inject(ToastController);

  private readonly connectedUser$: Observable<User | null> = user(this.auth);

  getConnectedUser(): Observable<User | null> {
    return this.connectedUser$;
  }

async register(email: string, password: string, alias: string): Promise<void> {
  let toast: HTMLIonToastElement | undefined;
  try {
    const userCred = await createUserWithEmailAndPassword(this.auth, email, password);
    const plainUser = JSON.parse(JSON.stringify(userCred.user));
    await this.userService.create({ ...plainUser, alias });
    await sendEmailVerification(userCred.user);
    toast = await this.toastController.create({
      message: 'Account created! Please verify your email.',
      duration: 2000,
    });
    await toast.present();
    await this.logout(); 
  } catch (error: any) {
    console.error('Registration error:', error);
    const message = error.code === 'auth/email-already-in-use'
      ? 'This email is already registered.'
      : 'Registration failed. Please try again.';
    toast = await this.toastController.create({ message, duration: 2500 });
    await toast.present();
  }
}
  async login(email: string, password: string): Promise<void> {
    let toast: HTMLIonToastElement | undefined;
    try {
      await signInWithEmailAndPassword(this.auth, email, password);
      this.router.navigateByUrl('/');
      toast = await this.toastController.create({
        message: `Login successful`,
        duration: 1500,
      });
    } catch (error) {
      console.error(error);
      toast = await this.toastController.create({
        message: `Something wrong happened during login`,
        duration: 1500,
      });
    } finally {
      await toast?.present();
    }
  }

async signInWithGoogle(): Promise<void> {
  let toast: HTMLIonToastElement | undefined;
  try {
    let firebaseUser;
    if (Capacitor.isNativePlatform()) {
      const result = await SocialLogin.login({ provider: 'google', options: {} });
      const googleResult = result.result as any;
      const credential = GoogleAuthProvider.credential(googleResult.idToken);
      const userCred = await signInWithCredential(this.auth, credential);
      firebaseUser = userCred.user;
    } else {
      const provider = new GoogleAuthProvider();
      const userCred = await signInWithPopup(this.auth, provider);
      firebaseUser = userCred.user;
    }
    const existing = await firstValueFrom(this.userService.getById(firebaseUser.uid));
    if (!existing) {
      const plainUser = JSON.parse(JSON.stringify(firebaseUser));
      await this.userService.create({
        ...plainUser,
        alias: firebaseUser.displayName ?? firebaseUser.email ?? firebaseUser.uid,
      });
    }
    this.router.navigateByUrl('/');
    toast = await this.toastController.create({
      message: 'Google login successful',
      duration: 1500,
    });
  } catch (error) {
    console.error('Google login error:', error);
    toast = await this.toastController.create({
      message: `Google login failed: ${(error as any)?.message}`,
      duration: 3000,
    });
  } finally {
    await toast?.present();
  }
}

  async logout(): Promise<void> {
    await signOut(this.auth);
    this.router.navigateByUrl('/');
  }

  sendResetPasswordLink(email: string): Promise<void> {
    return sendPasswordResetEmail(this.auth, email);
  }
}