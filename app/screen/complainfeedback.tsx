import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  StatusBar,
  Platform,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { doc, getDoc, addDoc, collection, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";

const FeedbackPage = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{ complainId: string }>();
  const { complainId } = params;

  const [message, setMessage] = useState("Your complaint has been solved.");
  const [loading, setLoading] = useState(true);
  const [complain, setComplain] = useState<any>(null);

  useEffect(() => {
    if (!complainId) return;

    const fetchComplain = async () => {
      setLoading(true);
      try {
        const complainDoc = await getDoc(doc(db, "complains", complainId));
        if (!complainDoc.exists()) {
          Alert.alert("Error", "Complaint not found");
          router.back();
          return;
        }
        setComplain({ id: complainDoc.id, ...complainDoc.data() });
      } catch (error) {
        console.error(error);
        Alert.alert("Error", "Failed to fetch complaint");
        router.back();
      } finally {
        setLoading(false);
      }
    };

    fetchComplain();
  }, [complainId]);

  const handleSendFeedback = async () => {
    if (!message.trim() || !complain) {
      Alert.alert("Error", "Message cannot be empty");
      return;
    }
    setLoading(true);
    try {
      // Create a notification for the user who submitted the complaint
      await addDoc(collection(db, "notifications"), {
        toUserId: complain.fromUserId,
        fromUserId: null, // Admin, can leave null or your admin UID
        message,
        type: "complaint_feedback",
        read: false,
        createdAt: serverTimestamp(),
        complainId: complain.id,
      });

      // Optionally, update the complaint status to "solved"
      await updateDoc(doc(db, "complains", complain.id), { status: "solved" });

      Alert.alert("Success", "Feedback sent to user");
      router.back();
    } catch (error: any) {
      console.error(error);
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3B7CF5" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#E6F2FF" }}>
      <StatusBar backgroundColor="#4A8FF0" barStyle="light-content" />
      {/* Header */}
      <LinearGradient
        colors={["#4A8FF0", "#65D4C9"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.header, { paddingTop: (Platform.OS === "android" ? StatusBar.currentHeight || 0 : 20) + 8 }]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Send Feedback</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.container}>
        <LinearGradient colors={["#3B7CF5", "#5AD9D5"]} style={styles.formCardGradient}>
          <View style={styles.formCard}>
            <Text style={styles.label}>Message to User:</Text>
            <TextInput
              style={[styles.input, { height: 120 }]}
              value={message}
              onChangeText={setMessage}
              multiline
            />

            <LinearGradient colors={["#4A8FF0", "#65D4C9"]} style={styles.sendButton}>
              <TouchableOpacity
                style={{ width: "100%", alignItems: "center" }}
                onPress={handleSendFeedback}
              >
                <Text style={styles.sendButtonText}>Send Feedback</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </LinearGradient>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    width: "100%",
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    elevation: 4,
  },
  backBtn: { padding: 4 },
  headerTitle: { color: "#fff", fontSize: 20, fontWeight: "700", marginLeft: 12 },

  container: { padding: 16, alignItems: "center" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },

  formCardGradient: { borderRadius: 20, width: "95%", padding: 2, marginTop: 30 },
  formCard: { backgroundColor: "#fff", borderRadius: 18, padding: 16 },
  label: { fontSize: 14, fontWeight: "600", color: "#3a125d", marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: "#333",
    marginBottom: 16,
    textAlignVertical: "top",
  },

  sendButton: { borderRadius: 24, paddingVertical: 12, marginTop: 8 },
  sendButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});

export default FeedbackPage;


