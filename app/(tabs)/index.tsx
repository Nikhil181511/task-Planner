import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { colors } from "../../constants/colors";

export default function HomeScreen() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth");
    }
  }, [user, loading]);

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/auth");
        },
      },
    ]);
  };

  if (loading || !user) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome Back</Text>
          <Text style={styles.email}>{user.email || "Guest User"}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color={colors.error} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>What would you like to do?</Text>

        <TouchableOpacity
          style={[styles.card, styles.primaryCard]}
          onPress={() => router.push("/ai-planner")}
        >
          <View style={styles.cardIcon}>
            <Ionicons name="bulb-outline" size={32} color={colors.background} />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>AI Task Planner</Text>
            <Text style={styles.cardDescription}>
              Transform ideas into structured tasks
            </Text>
          </View>
          <Ionicons name="arrow-forward" size={24} color={colors.background} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push("/tasks")}
        >
          <View style={styles.cardIcon}>
            <Ionicons name="list-outline" size={32} color={colors.text} />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>My Tasks</Text>
            <Text style={styles.cardDescription}>
              Manage your planned tasks
            </Text>
          </View>
          <Ionicons name="arrow-forward" size={24} color={colors.text} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push("/notes")}
        >
          <View style={styles.cardIcon}>
            <Ionicons
              name="document-text-outline"
              size={32}
              color={colors.text}
            />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.secondaryCardTitle}>Quick Notes</Text>
            <Text style={[styles.cardDescription, styles.secondaryDescription]}>
              Save quick thoughts and ideas
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.surface,
    padding: 20,
    paddingTop: 60,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  greeting: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.text,
    letterSpacing: 0.3,
  },
  email: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  logoutButton: {
    padding: 8,
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 16,
    color: colors.textSecondary,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  primaryCard: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surfaceLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});
