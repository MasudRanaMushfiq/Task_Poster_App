import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  StatusBar,
  Platform,
  SafeAreaView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";

export default function SolveComplain() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchComplaints() {
      try {
        const snap = await getDocs(collection(db, "complains"));
        const complaintsData: any[] = [];

        for (const docSnap of snap.docs) {
          const data = docSnap.data();
          // Fetch user info for fromUserId
          let fromUserName = "Unknown User";
          if (data.fromUserId) {
            const userSnap = await getDoc(doc(db, "users", data.fromUserId));
            if (userSnap.exists()) fromUserName = userSnap.data().fullName || "Unknown User";
          }

          complaintsData.push({
            id: docSnap.id,
            ...data,
            fromUserName,
          });
        }

        // Sort: pending first, solved later
        complaintsData.sort((a, b) => {
          if (a.status === b.status) return 0;
          if (a.status === "pending") return -1;
          return 1;
        });

        setComplaints(complaintsData);
      } catch (error) {
        console.error("Error fetching complaints:", error);
        Alert.alert("Error", "Failed to fetch complaints");
      } finally {
        setLoading(false);
      }
    }

    fetchComplaints();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3B7CF5" />
      </View>
    );
  }

  if (complaints.length === 0) {
    return (
      <View style={styles.centered}>
        <Text>No complaints found</Text>
      </View>
    );
  }

  const handleFeedback = (complainId: string) => {
    router.push({ pathname: "/screen/complainfeedback", params: { complainId } });
  };

  const handleUserClick = (uid: string) => {
    router.push(`/screen/viewuser?id=${uid}`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      {/* Header */}
      <LinearGradient
        colors={["#4A8FF0", "#65D4C9"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.header,
          { paddingTop: (Platform.OS === "android" ? StatusBar.currentHeight || 0 : 0) + 10 },
        ]}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>All Complaints</Text>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.container}>
        {complaints.map((complain) => (
          <LinearGradient
            key={complain.id}
            colors={["#4A8FF0", "#65D4C9"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cardBorder}
          >
            <View style={styles.card}>
              <Text style={styles.label}>From User:</Text>
              <TouchableOpacity onPress={() => handleUserClick(complain.fromUserId)}>
                <Text style={[styles.value, styles.link]}>{complain.fromUserName}</Text>
              </TouchableOpacity>

              <Text style={styles.label}>Title:</Text>
              <Text style={styles.value}>{complain.title || "-"}</Text>

              <Text style={styles.label}>Details:</Text>
              <Text style={styles.value}>{complain.details || "-"}</Text>

              <Text style={styles.label}>Status:</Text>
              <Text
                style={[
                  styles.value,
                  complain.status === "pending" ? { color: "#e89d07" } : { color: "#3B7CF5" },
                ]}
              >
                {complain.status}
              </Text>

              <TouchableOpacity
                style={styles.feedbackBtn}
                onPress={() => handleFeedback(complain.id)}
              >
                <Text style={styles.feedbackBtnText}>FeedBack</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#E6F2FF" },
  container: { padding: 16, flexGrow: 1 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#E6F2FF" },

  header: {
    width: "100%",
    paddingBottom: 20,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    elevation: 4,
  },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", position: "relative" },
  backBtn: { position: "absolute", left: 16, justifyContent: "center", alignItems: "center" },
  headerTitle: { color: "#fff", fontSize: 22, fontWeight: "700" },

  cardBorder: { borderRadius: 20, padding: 2, marginBottom: 16 },
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 16, elevation: 2 },

  label: { fontSize: 14, fontWeight: "600", color: "#0D1F3C", marginTop: 8 },
  value: { fontSize: 16, fontWeight: "500", color: "#0D1F3C", marginBottom: 4 },
  link: { textDecorationLine: "underline", color: "#3B7CF5" },

  feedbackBtn: {
    alignSelf: "flex-end",
    marginTop: 12,
    backgroundColor: "#4A8FF0",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  feedbackBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
});




