// app/_layout.tsx
import { AuthProvider } from "@/context/AuthContext";
import { notificationService } from "@/services/notificationService";
import { Stack } from "expo-router";
import React, { useEffect } from "react";

export default function RootLayout() {
  useEffect(() => {
    // Request notification permissions on app startup
    const setupNotifications = async () => {
      try {
        await notificationService.requestPermissions();
      } catch (error) {
        console.log("Notification setup error:", error);
        // Don't crash the app if notifications fail
      }
    };

    setupNotifications();
  }, []);

  return (
    <AuthProvider>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ title: "Sign In" }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="ai-planner" options={{ title: "AI Planner" }} />
        <Stack.Screen name="tasks" options={{ title: "My Tasks" }} />
        <Stack.Screen name="notes" options={{ title: "Quick Notes" }} />
      </Stack>
    </AuthProvider>
  );
}
