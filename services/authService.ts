import {
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    signInAnonymously,
    signInWithEmailAndPassword,
    signOut,
    User,
} from "firebase/auth";
import { auth } from "../config/firebase";

export const authService = {
  // Register new user
  async register(email: string, password: string): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      return userCredential.user;
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Login existing user
  async login(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      return userCredential.user;
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Anonymous login
  async loginAnonymously(): Promise<User> {
    try {
      const userCredential = await signInAnonymously(auth);
      return userCredential.user;
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Logout
  async logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Get current user
  getCurrentUser(): User | null {
    return auth.currentUser;
  },

  // Listen to auth state changes
  onAuthStateChanged(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
  },
};
