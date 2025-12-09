import { Injectable } from '@angular/core';
import {
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInAnonymously,
  UserCredential
} from '@angular/fire/auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private auth: Auth) {}

  // Register new user
  register(email: string, password: string): Promise<UserCredential> {
    return createUserWithEmailAndPassword(this.auth, email, password);
  }

  // Login existing user
  login(email: string, password: string): Promise<UserCredential> {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  // ⭐ Guest Login (Anonymous Sign-in)
  guestLogin(): Promise<UserCredential> {
    return signInAnonymously(this.auth);
  }

  // Logout
  logout(): Promise<void> {
    return signOut(this.auth);
  }

  // Get currently logged-in user
  get currentUser() {
    return this.auth.currentUser;
  }
}
