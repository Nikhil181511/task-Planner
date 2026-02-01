import AsyncStorage from "@react-native-async-storage/async-storage";

const TASKS_STORAGE_KEY = "@smartplan_tasks";

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

// Helper function to generate unique IDs
const generateId = () =>
  `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Helper to get all tasks from storage
const getAllTasksFromStorage = async (): Promise<Task[]> => {
  try {
    const tasksJson = await AsyncStorage.getItem(TASKS_STORAGE_KEY);
    if (!tasksJson) return [];

    const tasks = JSON.parse(tasksJson);
    // Convert date strings back to Date objects
    return tasks.map((task: any) => ({
      ...task,
      scheduledFor: new Date(task.scheduledFor),
      createdAt: new Date(task.createdAt),
    }));
  } catch (error) {
    console.error("Error reading tasks from storage:", error);
    return [];
  }
};

// Helper to save all tasks to storage
const saveAllTasksToStorage = async (tasks: Task[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.error("Error saving tasks to storage:", error);
    throw error;
  }
};

export const taskService = {
  // Create new task
  async createTask(
    userId: string,
    taskData: Omit<Task, "id" | "userId" | "createdAt">,
  ): Promise<string> {
    try {
      const tasks = await getAllTasksFromStorage();
      const newTask: Task = {
        id: generateId(),
        userId,
        ...taskData,
        createdAt: new Date(),
      };
      tasks.push(newTask);
      await saveAllTasksToStorage(tasks);

      // Schedule notification if task is not completed
      if (!newTask.completed) {
        await notificationService.scheduleTaskReminder(
          newTask.id!,
          newTask.title,
          newTask.scheduledFor,
        );
      }

      return newTask.id!;
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
      const existingTasks = await getAllTasksFromStorage();
      const newTasks: Task[] = tasks.map((task) => ({
        id: generateId(),
        userId,
        ...task,
        createdAt: new Date(),
      }));
      existingTasks.push(...newTasks);
      await saveAllTasksToStorage(existingTasks);

      // Schedule notifications for all new tasks
      for (const task of newTasks) {
        if (!task.completed) {
          await notificationService.scheduleTaskReminder(
            task.id!,
            task.title,
            task.scheduledFor,
          );
        }
      }
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Get all tasks for user
  async getTasks(userId: string): Promise<Task[]> {
    try {
      // First, cleanup old completed tasks
      await this.cleanupOldCompletedTasks(userId);

      const allTasks = await getAllTasksFromStorage();
      const userTasks = allTasks.filter((task) => task.userId === userId);

      // Sort by scheduled date
      return userTasks.sort(
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

      const allTasks = await getAllTasksFromStorage();
      const tasksToKeep = allTasks.filter((task) => {
        // Keep tasks that are:
        // 1. Not this user's tasks, OR
        // 2. Not completed, OR
        // 3. Scheduled for today or later
        if (task.userId !== userId) return true;
        if (!task.completed) return true;
        return task.scheduledFor >= startOfToday;
      });

      const deletedCount = allTasks.length - tasksToKeep.length;
      if (deletedCount > 0) {
        await saveAllTasksToStorage(tasksToKeep);
        console.log(`Cleaned up ${deletedCount} old completed tasks`);
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
      const allTasks = await getAllTasksFromStorage();
      const taskIndex = allTasks.findIndex((task) => task.id === taskId);
      if (taskIndex === -1) throw new Error("Task not found");

      allTasks[taskIndex].completed = completed;
      await saveAllTasksToStorage(allTasks);

      // Cancel notification if task is completed
      if (completed) {
        await notificationService.cancelTaskNotification(taskId);
      } else {
        // Reschedule if uncompleted
        const task = allTasks[taskIndex];
        await notificationService.scheduleTaskReminder(
          task.id!,
          task.title,
          task.scheduledFor,
        );
      }
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Update task
  async updateTask(taskId: string, updates: Partial<Task>): Promise<void> {
    try {
      const allTasks = await getAllTasksFromStorage();
      const taskIndex = allTasks.findIndex((task) => task.id === taskId);
      if (taskIndex === -1) throw new Error("Task not found");

      allTasks[taskIndex] = { ...allTasks[taskIndex], ...updates };
      await saveAllTasksToStorage(allTasks);

      // Reschedule notification if title or time changed and task is not completed
      const updatedTask = allTasks[taskIndex];
      if (!updatedTask.completed && (updates.title || updates.scheduledFor)) {
        await notificationService.scheduleTaskReminder(
          updatedTask.id!,
          updatedTask.title,
          updatedTask.scheduledFor,
        );
      }
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Delete task
  async deleteTask(taskId: string): Promise<void> {
    try {
      // Cancel notification before deleting
      await notificationService.cancelTaskNotification(taskId);

      const allTasks = await getAllTasksFromStorage();
      const filteredTasks = allTasks.filter((task) => task.id !== taskId);
      await saveAllTasksToStorage(filteredTasks);
    } catch (error: any) {
      throw new Error(error.message);
    }
  },
};
