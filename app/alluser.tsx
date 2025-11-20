import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  Platform,
} from "react-native";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons";
import { db } from "../firebaseConfig";
import { getAuth } from "firebase/auth";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

type User = {
  id: string;
  fullName?: string;
  email?: string;
  phone?: string;
  nid?: string;
  rating?: number;
  verified?: boolean;
  acceptedWorks?: any[];
};
type UserWithStats = User & {
  totalPosts: number;
  completedPosts: number;
  pendingPosts: number;
  appliedPosts: number;
};

export default function ShowAllUsers() {
  const [users, setUsers] = useState<UserWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();
  const currentUser = auth.currentUser;

  useEffect(() => {
    fetchUsersAndStats();
  }, []);

  async function fetchUsersAndStats() {
    setLoading(true);
    try {
      const usersCol = collection(db, "users");
      const usersSnap = await getDocs(usersCol);
      const usersList: UserWithStats[] = [];

      for (const userDoc of usersSnap.docs) {
        const userData = userDoc.data() as User;
        const postsQuery = query(
          collection(db, "worked"),
          where("userId", "==", userDoc.id)
        );
        const postsSnap = await getDocs(postsQuery);

        let totalPosts = postsSnap.size;
        let completedPosts = 0;
        let pendingPosts = 0;

        postsSnap.docs.forEach((postDoc) => {
          const postData = postDoc.data();
          if (postData.status === "completed") completedPosts++;
          else if (postData.status === "pending") pendingPosts++;
        });

        let appliedPosts = Array.isArray(userData.acceptedWorks)
          ? userData.acceptedWorks.length
          : 0;

        usersList.push({
          id: userDoc.id,
          fullName: userData.fullName,
          email: userData.email,
          phone: userData.phone,
          nid: userData.nid,
          rating: userData.rating ?? 1,
          verified: userData.verified ?? false,
          acceptedWorks: userData.acceptedWorks,
          totalPosts,
          completedPosts,
          pendingPosts,
          appliedPosts,
        });
      }

      setUsers(usersList);
    } catch (error) {
      console.error("Error fetching users or stats:", error);
      Alert.alert("Error", "Failed to fetch users data");
    } finally {
      setLoading(false);
    }
  }

  const toggleVerified = async (userId: string, currentStatus: boolean) => {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, { verified: !currentStatus });
      Alert.alert(
        "Success",
        `User is now ${!currentStatus ? "Verified" : "Not Verified"}`
      );
      fetchUsersAndStats();
    } catch (error) {
      console.error("Error toggling verified:", error);
      Alert.alert("Error", "Failed to update verification status");
    }
  };

  const deleteUser = (userId: string) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this user? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDoc(doc(db, "users", userId));
              Alert.alert("Deleted", "User has been deleted.");
              await fetchUsersAndStats();
            } catch (error) {
              console.error("Error deleting user:", error);
              Alert.alert("Error", "Failed to delete user");
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3B7CF5" />
      </View>
    );
  }

  const renderItem = ({ item }: { item: UserWithStats }) => (
    <LinearGradient
      colors={["#4A8FF0", "#65D4C9"]}
      style={styles.gradientCard}
    >
      <View style={styles.userCard}>
        <View style={styles.profileSection}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={styles.name}>{item.fullName || "No Name"}</Text>

            {/* Toggle verified for every user */}
            <TouchableOpacity
              onPress={() => toggleVerified(item.id, item.verified ?? false)}
              style={[
                styles.toggleRect,
                item.verified ? styles.verifiedOn : styles.verifiedOff,
              ]}
            >
              <Text
                style={[
                  styles.toggleText,
                  item.verified ? styles.textOn : styles.textOff,
                ]}
              >
                {item.verified ? "Verified" : "Not Verified"}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.email}>{item.email || "No Email"}</Text>
          <Text style={styles.phone}>{item.phone || "No Phone"}</Text>
          <Text style={styles.nid}>NID: {item.nid || "Not set"}</Text>

          <View style={styles.ratingRow}>
            <Ionicons name="star" size={18} color="#fbc02d" />
            <Text style={styles.ratingText}>
              {item.rating?.toFixed(1) || "1.0"}
            </Text>
          </View>

          {/* Delete user button */}
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => deleteUser(item.id)}
          >
            <Ionicons name="trash" size={18} color="#e63946" />
          </TouchableOpacity>
        </View>

        <View style={styles.statsSection}>
          <Text style={styles.statText}>Total Posts: {item.totalPosts}</Text>
          <Text style={styles.statText}>
            Completed Posts: {item.completedPosts}
          </Text>
          <Text style={styles.statText}>
            Pending Posts: {item.pendingPosts}
          </Text>
          <Text style={styles.statText}>
            Applied Posts: {item.appliedPosts}
          </Text>
        </View>
      </View>
    </LinearGradient>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#E6F2FF" }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      {/* Gradient Header */}
      <LinearGradient
        colors={["#4A8FF0", "#65D4C9"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[
          styles.header,
          { paddingTop: (Platform.OS === "android" ? StatusBar.currentHeight || 24 : 20) + 8 },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Users</Text>
      </LinearGradient>

      <View style={styles.container}>
        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#E6F2FF",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
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

  gradientCard: {
    borderRadius: 12,
    marginBottom: 14,
    padding: 2,
  },
  userCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    overflow: "hidden",
  },

  profileSection: {
    backgroundColor: "#3B7CF5",
    padding: 16,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  name: { fontSize: 20, fontWeight: "700", color: "#fff" },
  email: { fontSize: 14, color: "#ddd", marginTop: 4 },
  phone: { fontSize: 14, color: "#ddd", marginTop: 2 },
  nid: { fontSize: 14, color: "#ddd", marginTop: 2, fontStyle: "italic" },
  ratingRow: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  ratingText: { marginLeft: 6, color: "#fbc02d", fontWeight: "700", fontSize: 16 },

  statsSection: { backgroundColor: "#ECEEFc", padding: 16 },
  statText: { fontSize: 15, color: "#3a125d", marginBottom: 6, fontWeight: "600" },

  toggleRect: {
    marginLeft: 12,
    borderRadius: 14,
    paddingVertical: 4,
    paddingHorizontal: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  verifiedOn: { backgroundColor: "#4caf50" },
  verifiedOff: { backgroundColor: "#9e9e9e" },
  toggleText: { fontWeight: "700", fontSize: 14 },
  textOn: { color: "#fff" },
  textOff: { color: "#eee" },

  deleteBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "#fff",
    borderRadius: 6,
    padding: 4,
  },
  deleteText: { color: "#e63946", fontWeight: "600" },
});


