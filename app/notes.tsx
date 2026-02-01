import { useAuth } from "@/context/AuthContext";
import { Note, noteService } from "@/services/noteService";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { colors } from "../constants/colors";

export default function NotesScreen() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [noteContent, setNoteContent] = useState("");
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();

  const loadNotes = useCallback(async () => {
    if (!user) return;

    try {
      const userNotes = await noteService.getNotes(user.uid);
      setNotes(userNotes);
    } catch (error: any) {
      console.error("Error loading notes:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const onRefresh = () => {
    setRefreshing(true);
    loadNotes();
  };

  const handleNewNote = () => {
    setEditingNote(null);
    setNoteContent("");
    setModalVisible(true);
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setNoteContent(note.content);
    setModalVisible(true);
  };

  const handleSaveNote = async () => {
    if (!noteContent.trim()) {
      Alert.alert("Error", "Note cannot be empty");
      return;
    }

    if (!user) return;

    setSaving(true);
    try {
      if (editingNote) {
        await noteService.updateNote(editingNote.id!, noteContent);
      } else {
        await noteService.createNote(user.uid, noteContent);
      }
      setModalVisible(false);
      setNoteContent("");
      setEditingNote(null);
      await loadNotes();
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteNote = (note: Note) => {
    Alert.alert("Delete Note", "Are you sure you want to delete this note?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await noteService.deleteNote(note.id!);
            await loadNotes();
          } catch (error: any) {
            Alert.alert("Error", error.message);
          }
        },
      },
    ]);
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const noteDate = new Date(date);
    const diffMs = now.getTime() - noteDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return noteDate.toLocaleDateString();
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {notes.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons
              name="document-text-outline"
              size={64}
              color={colors.textTertiary}
            />
            <Text style={styles.emptyText}>No notes yet</Text>
            <Text style={styles.emptySubtext}>
              Tap the + button to create your first note
            </Text>
          </View>
        ) : (
          <View style={styles.notesContainer}>
            {notes.map((note) => (
              <TouchableOpacity
                key={note.id}
                style={styles.noteCard}
                onPress={() => handleEditNote(note)}
                onLongPress={() => handleDeleteNote(note)}
              >
                <View style={styles.noteHeader}>
                  <Text style={styles.noteDate}>
                    {formatDate(note.updatedAt)}
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleDeleteNote(note)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons
                      name="trash-outline"
                      size={20}
                      color={colors.danger}
                    />
                  </TouchableOpacity>
                </View>
                <Text style={styles.noteContent} numberOfLines={4}>
                  {note.content}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={handleNewNote}>
        <Ionicons name="add" size={28} color={colors.background} />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingNote ? "Edit Note" : "New Note"}
            </Text>
            <TouchableOpacity onPress={handleSaveNote} disabled={saving}>
              <Text
                style={[styles.saveButton, saving && styles.saveButtonDisabled]}
              >
                {saving ? "Saving..." : "Save"}
              </Text>
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.noteInput}
            placeholder="Start typing your note..."
            value={noteContent}
            onChangeText={setNoteContent}
            multiline
            autoFocus
            textAlignVertical="top"
          />
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
  },
  scrollView: {
    flex: 1,
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 80,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.textSecondary,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textTertiary,
    marginTop: 8,
    textAlign: "center",
  },
  notesContainer: {
    padding: 16,
  },
  noteCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  noteHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  noteDate: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  noteContent: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 22,
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingTop: 60,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
  },
  cancelButton: {
    fontSize: 16,
    color: colors.primary,
  },
  saveButton: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: "600",
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  noteInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    lineHeight: 24,
    color: colors.text,
  },
});
