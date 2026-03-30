import { Injectable, inject } from '@angular/core';
import { Observable, firstValueFrom, filter } from 'rxjs';
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  where,
  collection,
  query,
  updateDoc,
  setDoc,
  arrayUnion,
  arrayRemove,
  Firestore,
  getDocs,
  writeBatch,
  getDoc
} from 'firebase/firestore';
import { environment } from 'src/environments/environment';
import { Game } from '../models/game';
import { collectionData, docData } from 'rxfire/firestore';
import { AuthService } from './auth';
import { PlayerScore } from '../models/player';
@Injectable({ providedIn: 'root' })
export class GameService {
  private firestore: Firestore;
  private authService = inject(AuthService);

  constructor() {
    const app = initializeApp(environment.firebaseConfig);
    this.firestore = getFirestore(app);
  }

  async createGame(quizId: string): Promise<string> {
    const user = await firstValueFrom(this.authService.getConnectedUser());
    if (!user) throw new Error('Not authenticated');

    const gamesRef = collection(this.firestore, 'games');
    const gameRef = doc(gamesRef);

    await setDoc(gameRef, {
      refQuiz: quizId,
      entryCode: this.generateEntryCode(),
      status: 'waiting',
      players: [],
      adminId: user.uid,          
      currentQuestionIndex: 0,
      currentStatus: 'in-progress',
      currentQuestionStartTime: new Date(),
      createdAt: new Date(),
    });

    return gameRef.id;
  }

  async endGame(gameId: string): Promise<void> {
    await updateDoc(doc(this.firestore, 'games', gameId), {
      status: 'finished',
    });
  }
  getGame(gameId: string): Observable<Game> {
    const gameDoc = doc(this.firestore, 'games', gameId);
    return docData(gameDoc, { idField: 'id' }) as Observable<Game>;
  }

  getGameByEntryCode(entryCode: string): Observable<Game[]> {
    const gamesRef = collection(this.firestore, 'games');
    const q = query(
      gamesRef,
      where('entryCode', '==', entryCode.toUpperCase().trim()),
      where('status', '==', 'waiting')
    );
    return collectionData(q, { idField: 'id' }) as Observable<Game[]>;
  }

  async joinGame(gameId: string, alias: string): Promise<void> {
    const user = await firstValueFrom(this.authService.getConnectedUser());
    if (!user) throw new Error('Not authenticated');

    const playerEntry = {
      uid: user.uid,
      alias,
    };

    await updateDoc(doc(this.firestore, 'games', gameId), {
      players: arrayUnion(playerEntry),
    });
  }

  async leaveGame(gameId: string, alias: string): Promise<void> {
    const user = await firstValueFrom(this.authService.getConnectedUser());
    if (!user) return;

    const playerEntry = {
      uid: user.uid,
      alias,
    };

    await updateDoc(doc(this.firestore, 'games', gameId), {
      players: arrayRemove(playerEntry),
    });
  }

  async startGame(gameId: string): Promise<void> {
    await updateDoc(doc(this.firestore, 'games', gameId), {
      status: 'in-progress',
      currentQuestionStartTime: new Date(),
    });
  }



  private generateEntryCode(length = 4): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return Array.from({ length }, () =>
      chars.charAt(Math.floor(Math.random() * chars.length))
    ).join('');
  }

 async submitAnswer(
    gameId: string,
    questionIndex: number,
    choiceIndex: number
  ): Promise<void> {
    const user = await firstValueFrom(
      this.authService.getConnectedUser().pipe(filter(u => u !== null))
    );
    if (!user) throw new Error('Not authenticated');
 
    await setDoc(
      doc(this.firestore, `games/${gameId}/answers/${questionIndex}_${user.uid}`),
      {
        uid: user.uid,
        questionIndex,
        choiceIndex,
        answeredAt: new Date(),
      }
    );
  
}

  getAnswersForQuestion(gameId: string, questionIndex: number): Observable<any[]> {
    const answersRef = collection(this.firestore, `games/${gameId}/answers`);
    const q = query(answersRef, where('questionIndex', '==', questionIndex));
    return collectionData(q, { idField: 'id' }) as Observable<any[]>;
  }

  async hasAnswered(gameId: string, questionIndex: number): Promise<boolean> {
    const user = await firstValueFrom(
      this.authService.getConnectedUser().pipe(filter(u => u !== null))
    );
    if (!user) return false;

    const answerRef = doc(
      this.firestore,
      `games/${gameId}/answers/${questionIndex}_${user.uid}`
    );
    const snap = await getDoc(answerRef);
    return snap.exists();
  }


  async showQuestionResults(
  gameId: string,
  questionIndex: number,
  correctChoiceIndex: number,
  players: { uid: string; alias: string }[]
): Promise<void> {
  // Get question start time from game doc
  const gameDoc = await getDoc(doc(this.firestore, 'games', gameId));
  const questionStartTime: Date = gameDoc.data()?.['currentQuestionStartTime']?.toDate() ?? new Date();

  const answersRef = collection(this.firestore, `games/${gameId}/answers`);
  const q = query(answersRef, where('questionIndex', '==', questionIndex));
  const answersSnap = await getDocs(q);
  const answers = answersSnap.docs.map(d => d.data());

  // Fetch all existing scores at once
  const scoresRef = collection(this.firestore, `games/${gameId}/scores`);
  const scoresSnap = await getDocs(scoresRef);
  const existingScores: Record<string, number> = {};
  scoresSnap.docs.forEach(d => {
    existingScores[d.id] = d.data()['totalScore'] ?? 0;
  });

  const batch = writeBatch(this.firestore);

  for (const player of players) {
    const answer = answers.find(a => a['uid'] === player.uid);
    const isCorrect = answer?.['choiceIndex'] === correctChoiceIndex;

    let questionScore = 0;
    if (isCorrect && answer) {
      const answeredAt: Date = answer['answeredAt']?.toDate?.() ?? new Date();
      const timeElapsed = Math.min(30, (answeredAt.getTime() - questionStartTime.getTime()) / 1000);
      questionScore = Math.max(500, Math.round(1000 - (timeElapsed / 30) * 500));
      console.log(`${player.alias}: ${timeElapsed.toFixed(1)}s → ${questionScore}pts`);
    }

    const scoreRef = doc(this.firestore, `games/${gameId}/scores/${player.uid}`);
    batch.set(scoreRef, {
      uid: player.uid,
      alias: player.alias,
      totalScore: (existingScores[player.uid] ?? 0) + questionScore,
      lastQuestionScore: questionScore,
    });
  }

  await batch.commit();

  await updateDoc(doc(this.firestore, 'games', gameId), {
    currentStatus: 'done',
  });
}

async goToNextQuestion(gameId: string, nextIndex: number): Promise<void> {
  await updateDoc(doc(this.firestore, 'games', gameId), {
    currentQuestionIndex: nextIndex,
    currentStatus: 'in-progress',
    currentQuestionStartTime: new Date(),
  });
}
async getAnswersForQuestionSnapshot(gameId: string, questionIndex: number): Promise<any[]> {
  const answersRef = collection(this.firestore, `games/${gameId}/answers`);
  const q = query(answersRef, where('questionIndex', '==', questionIndex));
  const answersSnapshot = await getDocs(q);
  return answersSnapshot.docs.map(doc => doc.data());
}

getScores(gameId: string): Observable<PlayerScore[]> {
  const scoresRef = collection(this.firestore, `games/${gameId}/scores`);
  return collectionData(scoresRef, { idField: 'uid' }) as Observable<PlayerScore[]>;
}
}