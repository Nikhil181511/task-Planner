import { useAuth } from "@/context/AuthContext";
import { Task, taskService } from "@/services/taskService";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Modal,
    Platform,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { colors } from "../constants/colors";

export default function TasksScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<
    "all" | "today" | "upcoming" | "completed"
  >("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    priority: "Medium" as "High" | "Medium" | "Low",
    estimatedTime: "",
    scheduledFor: new Date().toISOString().split("T")[0],
    notes: "",
  });
  const { user } = useAuth();

  const loadTasks = useCallback(async () => {
    if (!user) return;

    try {
      const userTasks = await taskService.getTasks(user.uid);
      setTasks(userTasks);
    } catch (error: any) {
      console.error("Error loading tasks:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const onRefresh = () => {
    setRefreshing(true);
    loadTasks();
  };

  const handleToggleTask = async (taskId: string, completed: boolean) => {
    try {
      await taskService.toggleTaskCompletion(taskId, !completed);
      await loadTasks();
    } catch (error: any) {
      console.error("Error toggling task:", error);
    }
  };

  const handleAddTask = async () => {
    if (!user || !newTask.title || !newTask.estimatedTime) {
      Alert.alert("Error", "Please fill in title and estimated time");
      return;
    }

    try {
      await taskService.createTask(user.uid, {
        title: newTask.title,
        priority: newTask.priority,
        estimatedTime: newTask.estimatedTime,
        scheduledFor: new Date(newTask.scheduledFor),
        completed: false,
        notes: newTask.notes,
      });

      setShowAddModal(false);
      setNewTask({
        title: "",
        priority: "Medium",
        estimatedTime: "",
        scheduledFor: new Date().toISOString().split("T")[0],
        notes: "",
      });
      await loadTasks();
      Alert.alert("Success", "Task created successfully!");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  const getFilteredTasks = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    switch (filter) {
      case "today":
        return tasks.filter((task) => {
          const taskDate = new Date(task.scheduledFor);
          taskDate.setHours(0, 0, 0, 0);
          return taskDate.getTime() === today.getTime() && !task.completed;
        });
      case "upcoming":
        return tasks.filter((task) => {
          const taskDate = new Date(task.scheduledFor);
          taskDate.setHours(0, 0, 0, 0);
          return taskDate.getTime() >= tomorrow.getTime() && !task.completed;
        });
      case "completed":
        return tasks.filter((task) => task.completed);
      default:
        return tasks;
    }
  };

  const groupTasksByDate = (tasks: Task[]) => {
    const grouped: { [key: string]: Task[] } = {};
    tasks.forEach((task) => {
      const dateKey = new Date(task.scheduledFor).toDateString();
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(task);
    });
    return grouped;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return colors.priorityHigh;
      case "Medium":
        return colors.priorityMedium;
      case "Low":
        return colors.priorityLow;
      default:
        return colors.textTertiary;
    }
  };

  const filteredTasks = getFilteredTasks();
  const groupedTasks = groupTasksByDate(filteredTasks);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {(["all", "today", "upcoming", "completed"] as const).map((f) => (
            <TouchableOpacity
              key={f}
              style={[
                styles.filterButton,
                filter === f && styles.filterButtonActive,
              ]}
              onPress={() => setFilter(f)}
            >
              <Text
                style={[
                  styles.filterText,
                  filter === f && styles.filterTextActive,
                ]}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {filteredTasks.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons
              name="clipboard-outline"
              size={64}
              color={colors.textTertiary}
            />
            <Text style={styles.emptyText}>No tasks found</Text>
            <Text style={styles.emptySubtext}>
              {filter === "completed"
                ? "Complete some tasks to see them here"
                : "Create tasks using AI Planner"}
            </Text>
          </View>
        ) : (
          Object.entries(groupedTasks).map(([date, dateTasks]) => (
            <View key={date} style={styles.dateGroup}>
              <Text style={styles.dateHeader}>{date}</Text>
              {dateTasks.map((task) => (
                <View key={task.id} style={styles.taskCard}>
                  <TouchableOpacity
                    style={styles.checkboxContainer}
                    onPress={() => handleToggleTask(task.id!, task.completed)}
                  >
                    <Ionicons
                      name={
                        task.completed ? "checkmark-circle" : "ellipse-outline"
                      }
                      size={28}
                      color={task.completed ? colors.success : colors.text}
                    />
                  </TouchableOpacity>
                  <View style={styles.taskContent}>
                    <Text
                      style={[
                        styles.taskTitle,
                        task.completed && styles.taskTitleCompleted,
                      ]}
                    >
                      {task.title}
                    </Text>
                    <View style={styles.taskMeta}>
                      <View
                        style={[
                          styles.priorityBadge,
                          { backgroundColor: getPriorityColor(task.priority) },
                        ]}
                      >
                        <Text style={styles.priorityText}>{task.priority}</Text>
                      </View>
                      <View style={styles.metaItem}>
                        <Ionicons
                          name="time-outline"
                          size={14}
                          color={colors.textSecondary}
                        />
                        <Text style={styles.metaText}>
                          {task.estimatedTime}
                        </Text>
                      </View>
                    </View>
                    {task.notes && (
                      <Text style={styles.taskNotes}>{task.notes}</Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          ))
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowAddModal(true)}
      >
        <Ionicons name="add" size={28} color={colors.background} />
      </TouchableOpacity>

      {/* Add Task Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Task</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={28} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              <Text style={styles.label}>Task Title *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Complete project report"
                placeholderTextColor={colors.textTertiary}
                value={newTask.title}
                onChangeText={(text) => setNewTask({ ...newTask, title: text })}
              />

              <Text style={styles.label}>Priority</Text>
              <View style={styles.priorityButtons}>
                {(["High", "Medium", "Low"] as const).map((p) => (
                  <TouchableOpacity
                    key={p}
                    style={[
                      styles.priorityButton,
                      newTask.priority === p && styles.priorityButtonActive,
                      { borderColor: getPriorityColor(p) },
                    ]}
                    onPress={() => setNewTask({ ...newTask, priority: p })}
                  >
                    <Text
                      style={[
                        styles.priorityButtonText,
                        newTask.priority === p && {
                          color: getPriorityColor(p),
                        },
                      ]}
                    >
                      {p}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Estimated Time *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 2 hours, 30 mins"
                placeholderTextColor={colors.textTertiary}
                value={newTask.estimatedTime}
                onChangeText={(text) =>
                  setNewTask({ ...newTask, estimatedTime: text })
                }
              />

              <Text style={styles.label}>Scheduled For *</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.textTertiary}
                value={newTask.scheduledFor}
                onChangeText={(text) =>
                  setNewTask({ ...newTask, scheduledFor: text })
                }
              />

              <Text style={styles.label}>Notes (Optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Additional notes..."
                placeholderTextColor={colors.textTertiary}
                value={newTask.notes}
                onChangeText={(text) => setNewTask({ ...newTask, notes: text })}
                multiline
                numberOfLines={3}
              />

              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleAddTask}
              >
                <Ionicons
                  name="checkmark"
                  size={20}
                  color={colors.background}
                />
                <Text style={styles.saveButtonText}>Create Task</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  filterContainer: {
    backgroundColor: colors.surface,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  filterTextActive: {
    color: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  emptyContainer: {
    padding: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: "center",
  },
  dateGroup: {
    marginBottom: 24,
  },
  dateHeader: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textSecondary,
    marginLeft: 16,
    marginTop: 16,
    marginBottom: 8,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  taskCard: {
    backgroundColor: colors.surface,
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    borderWidth: 1,
    borderColor: colors.border,
  },
  checkboxContainer: {
    marginRight: 12,
    paddingTop: 2,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 8,
  },
  taskTitleCompleted: {
    textDecorationLine: "line-through",
    color: colors.textTertiary,
  },
  taskMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priorityText: {
    color: colors.background,
    fontSize: 11,
    fontWeight: "700",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  taskNotes: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 8,
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
    paddingBottom: Platform.OS === "ios" ? 40 : 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.text,
  },
  modalForm: {
    padding: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textSecondary,
    marginBottom: 8,
    marginTop: 16,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  input: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  priorityButtons: {
    flexDirection: "row",
    gap: 8,
  },
  priorityButton: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
    backgroundColor: colors.surfaceLight,
  },
  priorityButtonActive: {
    backgroundColor: colors.surface,
  },
  priorityButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  saveButton: {
    flexDirection: "row",
    gap: 8,
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
  },
  saveButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: "600",
  },
});
