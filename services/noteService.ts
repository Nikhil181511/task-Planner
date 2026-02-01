import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    orderBy,
    query,
    Timestamp,
    updateDoc,
    where,
} from "firebase/firestore";
import { db } from "../config/firebase";

export interface Note {
  id?: string;
  userId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export const noteService = {
  // Create new note
  async createNote(userId: string, content: string): Promise<string> {
    try {
      const now = Timestamp.now();
      const docRef = await addDoc(collection(db, "notes"), {
        userId,
        content,
        createdAt: now,
        updatedAt: now,
      });
      return docRef.id;
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Get all notes for user
  async getNotes(userId: string): Promise<Note[]> {
    try {
      const q = query(
        collection(db, "notes"),
        where("userId", "==", userId),
        orderBy("updatedAt", "desc"),
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt.toDate(),
            updatedAt: doc.data().updatedAt.toDate(),
          }) as Note,
      );
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Update note
  async updateNote(noteId: string, content: string): Promise<void> {
    try {
      const noteRef = doc(db, "notes", noteId);
      await updateDoc(noteRef, {
        content,
        updatedAt: Timestamp.now(),
      });
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Delete note
  async deleteNote(noteId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, "notes", noteId));
    } catch (error: any) {
      throw new Error(error.message);
    }
  },
};
