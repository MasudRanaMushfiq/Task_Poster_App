import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPosts: 0,
    approvedPosts: 0,
    pendingPosts: 0,
    completedPosts: 0,
    totalComplaints: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const usersSnap = await getDocs(collection(db, "users"));
        const totalUsers = usersSnap.size;

        const workedSnap = await getDocs(collection(db, "worked"));
        const totalPosts = workedSnap.size;

        const approvedSnap = await getDocs(
          query(collection(db, "worked"), where("status", "==", "active"))
        );
        const approvedPosts = approvedSnap.size;

        const pendingSnap = await getDocs(
          query(collection(db, "worked"), where("status", "==", "accepted"))
        );
        const pendingPosts = pendingSnap.size;

        const completedSnap = await getDocs(
          query(collection(db, "worked"), where("status", "==", "completed"))
        );
        const completedPosts = completedSnap.size;

        const complaintsSnap = await getDocs(collection(db, "complains"));
        const totalComplaints = complaintsSnap.size;

        setStats({
          totalUsers,
          totalPosts,
          approvedPosts,
          pendingPosts,
          completedPosts,
          totalComplaints,
        });
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3B7CF5" />
      </View>
    );
  }

  const cards = [
    { key: "users", icon: "people", value: stats.totalUsers, label: "All Users", colors: ["#3B7CF5", "#5AD9D5"], route: "/alluser" },
    { key: "posts", icon: "document-text", value: stats.totalPosts, label: "All Posts", colors: ["#5AD9D5", "#3B7CF5"], route: "/screen/allpost" },
    { key: "active", icon: "checkmark-circle", value: stats.approvedPosts, label: "Active Post", colors: ["#3B7CF5", "#65D4C9"], route: "/screen/activepost" },
    { key: "accepted", icon: "time", value: stats.pendingPosts, label: "Pending", colors: ["#65D4C9", "#3B7CF5"], route: "/screen/pendingpost" },
    { key: "completed", icon: "checkmark-done", value: stats.completedPosts, label: "Completed", colors: ["#3B7CF5", "#4AB8F0"], route: "/screen/completedpost" },
    { key: "complaints", icon: "alert-circle", value: stats.totalComplaints, label: "Complaints", colors: ["#F45A5A", "#FF7F7F"], route: "/screen/showcomplain" },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <LinearGradient
        colors={["#4A8FF0", "#65D4C9"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.header,
          {
            paddingTop:
              (Platform.OS === "android" ? StatusBar.currentHeight || 0 : 0) + 10,
          },
        ]}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Admin Dashboard</Text>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.grid}>
          {cards.map((card) => (
            <LinearGradient
              key={card.key}
              colors={card.colors as [string, string]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.card}
            >
              <TouchableOpacity
                onPress={() => router.push(card.route as any)}
                style={styles.cardContent}
                activeOpacity={0.8}
              >
                <View style={styles.topRow}>
                  <Ionicons
                    name={card.icon as any}
                    size={50}
                    color="#fff"
                    style={{ marginRight: 16 }}
                  />
                  <Text style={styles.number}>{card.value}</Text>
                </View>
                <Text style={styles.title}>{card.label}</Text>
              </TouchableOpacity>
            </LinearGradient>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#E6F2FF",
  },
  container: {
    padding: 16,
    backgroundColor: "#E6F2FF",
    flexGrow: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E6F2FF",
  },
  header: {
    width: "100%",
    paddingBottom: 20,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    elevation: 4,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  backBtn: {
    position: "absolute",
    left: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 20,
  },
  card: {
    width: "48%",
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
  },
  cardContent: { flexDirection: "column" },
  topRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  number: { fontSize: 28, fontWeight: "700", color: "#fff" },
  title: { fontSize: 14, fontWeight: "600", color: "#fff", textAlign: "center" },
});



