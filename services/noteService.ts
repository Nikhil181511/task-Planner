import AsyncStorage from "@react-native-async-storage/async-storage";

const NOTES_STORAGE_KEY = "@smartplan_notes";

export interface Note {
  id?: string;
  userId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

// Helper function to generate unique IDs
const generateId = () =>
  `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Helper to get all notes from storage
const getAllNotesFromStorage = async (): Promise<Note[]> => {
  try {
    const notesJson = await AsyncStorage.getItem(NOTES_STORAGE_KEY);
    if (!notesJson) return [];

    const notes = JSON.parse(notesJson);
    // Convert date strings back to Date objects
    return notes.map((note: any) => ({
      ...note,
      createdAt: new Date(note.createdAt),
      updatedAt: new Date(note.updatedAt),
    }));
  } catch (error) {
    console.error("Error reading notes from storage:", error);
    return [];
  }
};

// Helper to save all notes to storage
const saveAllNotesToStorage = async (notes: Note[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
  } catch (error) {
    console.error("Error saving notes to storage:", error);
    throw error;
  }
};

export const noteService = {
  // Create new note
  async createNote(userId: string, content: string): Promise<string> {
    try {
      const notes = await getAllNotesFromStorage();
      const now = new Date();
      const newNote: Note = {
        id: generateId(),
        userId,
        content,
        createdAt: now,
        updatedAt: now,
      };
      notes.push(newNote);
      await saveAllNotesToStorage(notes);
      return newNote.id!;
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Get all notes for user
  async getNotes(userId: string): Promise<Note[]> {
    try {
      const allNotes = await getAllNotesFromStorage();
      const userNotes = allNotes.filter((note) => note.userId === userId);

      // Sort by updatedAt in descending order (newest first)
      return userNotes.sort(
        (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime(),
      );
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Update note
  async updateNote(noteId: string, content: string): Promise<void> {
    try {
      const allNotes = await getAllNotesFromStorage();
      const noteIndex = allNotes.findIndex((note) => note.id === noteId);
      if (noteIndex === -1) throw new Error("Note not found");

      allNotes[noteIndex].content = content;
      allNotes[noteIndex].updatedAt = new Date();
      await saveAllNotesToStorage(allNotes);
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Delete note
  async deleteNote(noteId: string): Promise<void> {
    try {
      const allNotes = await getAllNotesFromStorage();
      const filteredNotes = allNotes.filter((note) => note.id !== noteId);
      await saveAllNotesToStorage(filteredNotes);
    } catch (error: any) {
      throw new Error(error.message);
    }
  },
};
