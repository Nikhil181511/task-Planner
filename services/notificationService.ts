import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

const NOTIFICATION_IDS_KEY = "@smartplan_notification_ids";

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const notificationService = {
  // Request permissions and setup notifications
  async requestPermissions(): Promise<boolean> {
    if (!Device.isDevice) {
      console.log("Notifications only work on physical devices");
      return false;
    }

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("Failed to get push notification permissions");
      return false;
    }

    // Configure notification channel for Android
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("task-reminders", {
        name: "Task Reminders",
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    return true;
  },

  // Schedule notification 5 minutes before task
  async scheduleTaskReminder(
    taskId: string,
    taskTitle: string,
    scheduledTime: Date,
  ): Promise<void> {
    try {
      // Cancel existing notification for this task if any
      await this.cancelTaskNotification(taskId);

      // Calculate 5 minutes before the scheduled time
      const reminderTime = new Date(scheduledTime.getTime() - 5 * 60 * 1000);
      const now = new Date();

      // Only schedule if the reminder time is in the future
      if (reminderTime <= now) {
        console.log(
          `Skipping notification for ${taskTitle} - reminder time has passed`,
        );
        return;
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: "Task Starting Soon! ⏰",
          body: `${taskTitle} starts in 5 minutes`,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
          data: { taskId },
        },
        trigger: {
          date: reminderTime,
          channelId: "task-reminders",
        },
      });

      // Store notification ID for later cancellation
      await this.storeNotificationId(taskId, notificationId);

      console.log(
        `Scheduled notification for ${taskTitle} at ${reminderTime.toLocaleTimeString()}`,
      );
    } catch (error) {
      console.error("Error scheduling notification:", error);
    }
  },

  // Cancel notification for a specific task
  async cancelTaskNotification(taskId: string): Promise<void> {
    try {
      const notificationId = await this.getNotificationId(taskId);
      if (notificationId) {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
        await this.removeNotificationId(taskId);
        console.log(`Cancelled notification for task ${taskId}`);
      }
    } catch (error) {
      console.error("Error cancelling notification:", error);
    }
  },

  // Cancel all scheduled notifications
  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      await AsyncStorage.removeItem(NOTIFICATION_IDS_KEY);
      console.log("Cancelled all notifications");
    } catch (error) {
      console.error("Error cancelling all notifications:", error);
    }
  },

  // Helper: Store notification ID for a task
  async storeNotificationId(
    taskId: string,
    notificationId: string,
  ): Promise<void> {
    try {
      const idsJson = await AsyncStorage.getItem(NOTIFICATION_IDS_KEY);
      const ids = idsJson ? JSON.parse(idsJson) : {};
      ids[taskId] = notificationId;
      await AsyncStorage.setItem(NOTIFICATION_IDS_KEY, JSON.stringify(ids));
    } catch (error) {
      console.error("Error storing notification ID:", error);
    }
  },

  // Helper: Get notification ID for a task
  async getNotificationId(taskId: string): Promise<string | null> {
    try {
      const idsJson = await AsyncStorage.getItem(NOTIFICATION_IDS_KEY);
      if (!idsJson) return null;
      const ids = JSON.parse(idsJson);
      return ids[taskId] || null;
    } catch (error) {
      console.error("Error getting notification ID:", error);
      return null;
    }
  },

  // Helper: Remove notification ID for a task
  async removeNotificationId(taskId: string): Promise<void> {
    try {
      const idsJson = await AsyncStorage.getItem(NOTIFICATION_IDS_KEY);
      if (!idsJson) return;
      const ids = JSON.parse(idsJson);
      delete ids[taskId];
      await AsyncStorage.setItem(NOTIFICATION_IDS_KEY, JSON.stringify(ids));
    } catch (error) {
      console.error("Error removing notification ID:", error);
    }
  },
};
