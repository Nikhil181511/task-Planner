import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    query,
    Timestamp,
    updateDoc,
    where,
} from "firebase/firestore";
import { db } from "../config/firebase";

export interface Task {
  id?: string;
  userId: string;
  title: string;
  priority: "High" | "Medium" | "Low";
  estimatedTime: string;
  scheduledFor: Date;
  completed: boolean;
  notes?: string;
  createdAt: Date;
}

export const taskService = {
  // Create new task
  async createTask(
    userId: string,
    taskData: Omit<Task, "id" | "userId" | "createdAt">,
  ): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, "tasks"), {
        userId,
        ...taskData,
        scheduledFor: Timestamp.fromDate(taskData.scheduledFor),
        createdAt: Timestamp.now(),
      });
      return docRef.id;
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Create multiple tasks
  async createTasks(
    userId: string,
    tasks: Omit<Task, "id" | "userId" | "createdAt">[],
  ): Promise<void> {
    try {
      const promises = tasks.map((task) => this.createTask(userId, task));
      await Promise.all(promises);
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Get all tasks for user
  async getTasks(userId: string): Promise<Task[]> {
    try {
      // First, cleanup old completed tasks
      await this.cleanupOldCompletedTasks(userId);

      // Simple query without orderBy to avoid needing a composite index
      const q = query(collection(db, "tasks"), where("userId", "==", userId));
      const querySnapshot = await getDocs(q);
      const tasks = querySnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
            scheduledFor: doc.data().scheduledFor.toDate(),
            createdAt: doc.data().createdAt.toDate(),
          }) as Task,
      );

      // Sort in memory instead of in the database
      return tasks.sort(
        (a, b) => a.scheduledFor.getTime() - b.scheduledFor.getTime(),
      );
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Cleanup completed tasks from previous days
  async cleanupOldCompletedTasks(userId: string): Promise<void> {
    try {
      // Get start of today (midnight)
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      const q = query(
        collection(db, "tasks"),
        where("userId", "==", userId),
        where("completed", "==", true),
      );

      const querySnapshot = await getDocs(q);

      // Delete tasks that are completed and scheduled before today
      const deletePromises = querySnapshot.docs
        .filter((doc) => {
          const scheduledFor = doc.data().scheduledFor.toDate();
          return scheduledFor < startOfToday;
        })
        .map((doc) => deleteDoc(doc.ref));

      if (deletePromises.length > 0) {
        await Promise.all(deletePromises);
        console.log(`Cleaned up ${deletePromises.length} old completed tasks`);
      }
    } catch (error: any) {
      // Don't throw error for cleanup, just log it
      console.error("Error cleaning up old tasks:", error.message);
    }
  },

  // Update task completion status
  async toggleTaskCompletion(
    taskId: string,
    completed: boolean,
  ): Promise<void> {
    try {
      const taskRef = doc(db, "tasks", taskId);
      await updateDoc(taskRef, { completed });
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Update task
  async updateTask(taskId: string, updates: Partial<Task>): Promise<void> {
    try {
      const taskRef = doc(db, "tasks", taskId);
      const updateData: any = { ...updates };
      if (updates.scheduledFor) {
        updateData.scheduledFor = Timestamp.fromDate(updates.scheduledFor);
      }
      await updateDoc(taskRef, updateData);
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Delete task
  async deleteTask(taskId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, "tasks", taskId));
    } catch (error: any) {
      throw new Error(error.message);
    }
  },
};
