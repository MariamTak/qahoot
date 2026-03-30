import { Routes } from '@angular/router';
import { isAuthenticatedGuard } from './guards/is-authenticated-guard';
export const routes: Routes = [
  {
    path: 'home',
    canActivate: [isAuthenticatedGuard],
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },

  {
    path: 'quiz-detail/:id',
    loadComponent: () => import('./quiz-detail/quiz-detail.page').then( m => m.QuizDetailPage)
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then( m => m.LoginPage)
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register.page').then( m => m.RegisterPage)
  },
  {
    path: 'password-retrieve',
    loadComponent: () => import('./pages/password-retrieve/password-retrieve.page').then( m => m.PasswordRetrievePage)
  }
  ,
{
  path: 'game-lobby/:id',
  loadComponent: () => import('./game/game-waiting/game-waiting').then(m => { return m.GameWaitingPage; })
},



  {
  path: 'join-game',
  canActivate: [isAuthenticatedGuard],
  loadComponent: () => import('./game/join-game.page').then(m => m.JoinGamePage)
},
{
  path: 'game/:id/play',
  loadComponent: () => import('./game/game-play/game-play.component').then(m => m.GamePlayComponent)
},
{
  path: 'game/:id/results',
  loadComponent: () =>
    import('./game/game-results/game-results.page').then(m => m.GameResultsPage)
},




];
