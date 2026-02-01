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
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="sparkles" size={20} color="#fff" />
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
                  <Ionicons name="warning" size={20} color="#FF9500" />
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
    backgroundColor: "#f5f5f5",
  },
  scrollView: {
    flex: 1,
  },
  inputContainer: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
    lineHeight: 22,
  },
  textArea: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    minHeight: 200,
    marginBottom: 16,
  },
  button: {
    flexDirection: "row",
    backgroundColor: "#007AFF",
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
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  resultContainer: {
    padding: 20,
  },
  planTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#333",
  },
  overview: {
    fontSize: 16,
    color: "#666",
    marginBottom: 24,
    lineHeight: 22,
  },
  tasksHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  tasksTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
  },
  taskCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#eee",
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
    color: "#666",
    marginRight: 8,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
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
    color: "#666",
  },
  taskNotes: {
    fontSize: 14,
    color: "#999",
    fontStyle: "italic",
    marginTop: 8,
  },
  conflictsBox: {
    backgroundColor: "#FFF9E6",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#FFD60A",
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
    color: "#FF9500",
  },
  conflictText: {
    fontSize: 14,
    color: "#666",
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
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#007AFF",
  },
  secondaryButtonText: {
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
