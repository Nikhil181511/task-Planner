import { useAuth } from "@/context/AuthContext";
import { aiService, AITaskPlan } from "@/services/aiService";
import { taskService } from "@/services/taskService";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { colors } from "../constants/colors";

export default function AIPlanner() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<AITaskPlan | null>(null);
  const [editing, setEditing] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const handleAnalyze = async () => {
    if (!input.trim()) {
      Alert.alert("Error", "Please enter some text to analyze");
      return;
    }

    if (!user) {
      Alert.alert("Error", "You must be logged in");
      return;
    }

    setLoading(true);
    try {
      // Fetch existing tasks to avoid conflicts
      const existingTasks = await taskService.getTasks(user.uid);
      const existingTasksForAI = existingTasks.map((task) => ({
        title: task.title,
        scheduledFor: task.scheduledFor.toISOString().split("T")[0],
        estimatedTime: task.estimatedTime,
        priority: task.priority,
      }));

      const result = await aiService.analyzeAndPlan(input, existingTasksForAI);
      setPlan(result);
      setEditing(false);

      // Show conflicts warning if any
      if (result.conflicts && result.conflicts.length > 0) {
        Alert.alert(
          "⚠️ Scheduling Conflicts Detected",
          result.conflicts.join("\n\n"),
          [{ text: "OK" }],
        );
      }
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTasks = async () => {
    if (!plan || !user) return;

    setLoading(true);
    try {
      const tasks = plan.tasks.map((task) => ({
        title: task.task,
        priority: task.priority,
        estimatedTime: task.estimatedTime,
        scheduledFor: new Date(task.scheduledFor),
        completed: false,
        notes: task.notes || "",
      }));

      await taskService.createTasks(user.uid, tasks);
      Alert.alert("Success", "Tasks saved successfully!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "#FF3B30";
      case "Medium":
        return "#FF9500";
      case "Low":
        return "#34C759";
      default:
        return "#999";
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView}>
        {!plan ? (
          <View style={styles.inputContainer}>
            <Text style={styles.title}>AI Task Planner</Text>
            <Text style={styles.subtitle}>
              Paste or type your messy ideas, and AI will organize them into
              structured tasks
            </Text>
            <TextInput
              style={styles.textArea}
              placeholder="Example: Need to organize birthday party next week, buy groceries, finish project report..."
              value={input}
              onChangeText={setInput}
              multiline
              numberOfLines={10}
              textAlignVertical="top"
              editable={!loading}
            />
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleAnalyze}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.background} />
              ) : (
                <>
                  <Ionicons
                    name="sparkles"
                    size={20}
                    color={colors.background}
                  />
                  <Text style={styles.buttonText}>Analyze with AI</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.resultContainer}>
            <Text style={styles.planTitle}>{plan.title}</Text>
            <Text style={styles.overview}>{plan.overview}</Text>

            {plan.conflicts && plan.conflicts.length > 0 && (
              <View style={styles.conflictsBox}>
                <View style={styles.conflictHeader}>
                  <Ionicons name="warning" size={20} color={colors.warning} />
                  <Text style={styles.conflictTitle}>Scheduling Conflicts</Text>
                </View>
                {plan.conflicts.map((conflict, idx) => (
                  <Text key={idx} style={styles.conflictText}>
                    • {conflict}
                  </Text>
                ))}
              </View>
            )}

            <View style={styles.tasksHeader}>
              <Text style={styles.tasksTitle}>Tasks ({plan.tasks.length})</Text>
            </View>

            {plan.tasks.map((task, index) => (
              <View key={index} style={styles.taskCard}>
                <View style={styles.taskHeader}>
                  <View style={styles.taskTitleRow}>
                    <Text style={styles.taskNumber}>{index + 1}.</Text>
                    <Text style={styles.taskTitle}>{task.task}</Text>
                  </View>
                  <View
                    style={[
                      styles.priorityBadge,
                      { backgroundColor: getPriorityColor(task.priority) },
                    ]}
                  >
                    <Text style={styles.priorityText}>{task.priority}</Text>
                  </View>
                </View>
                <View style={styles.taskDetails}>
                  <View style={styles.taskDetail}>
                    <Ionicons name="time-outline" size={16} color="#666" />
                    <Text style={styles.taskDetailText}>
                      {task.estimatedTime}
                    </Text>
                  </View>
                  <View style={styles.taskDetail}>
                    <Ionicons name="calendar-outline" size={16} color="#666" />
                    <Text style={styles.taskDetailText}>
                      {task.scheduledFor}
                    </Text>
                  </View>
                </View>
                {task.notes && (
                  <Text style={styles.taskNotes}>{task.notes}</Text>
                )}
              </View>
            ))}

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={() => {
                  setPlan(null);
                  setInput("");
                }}
                disabled={loading}
              >
                <Text style={styles.secondaryButtonText}>Start Over</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.primaryButton]}
                onPress={handleSaveTasks}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Save Tasks</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  inputContainer: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 8,
    color: colors.text,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 20,
    lineHeight: 20,
  },
  textArea: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 200,
    marginBottom: 16,
    color: colors.text,
  },
  button: {
    flexDirection: "row",
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: "600",
  },
  resultContainer: {
    padding: 20,
  },
  planTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 12,
    color: colors.text,
  },
  overview: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 24,
    lineHeight: 20,
  },
  tasksHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  tasksTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textSecondary,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  taskCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  taskTitleRow: {
    flexDirection: "row",
    flex: 1,
    marginRight: 12,
  },
  taskNumber: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textSecondary,
    marginRight: 8,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    color: colors.background,
    fontSize: 12,
    fontWeight: "700",
  },
  taskDetails: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 8,
  },
  taskDetail: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  taskDetailText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  taskNotes: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
  },
  conflictsBox: {
    backgroundColor: "rgba(255, 214, 10, 0.1)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.warning,
  },
  conflictHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  conflictTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.warning,
  },
  conflictText: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 6,
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
  primaryButton: {
    flex: 1,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "600",
  },
});
