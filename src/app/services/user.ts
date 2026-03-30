import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  collection,
  collectionData,
  doc,
  setDoc,
  Firestore,
} from '@angular/fire/firestore';
import { User } from '@angular/fire/auth';
import { docData } from 'rxfire/firestore';

export interface UserWithAlias extends User {
  alias: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private firestore = inject(Firestore);

  usersCollection = collection(this.firestore, 'users');

  create(user: UserWithAlias) {
    return setDoc(doc(this.firestore, `users/${user.uid}`), {
      alias: user.alias,
    });
  }

  getAll() {
    return collectionData(this.usersCollection, {
      idField: 'id',
    }) as Observable<UserWithAlias[]>;
  }
  getById(uid: string): Observable<UserWithAlias | undefined> {
  const userDoc = doc(this.firestore, `users/${uid}`);
  return docData(userDoc) as Observable<UserWithAlias | undefined>;
}
}