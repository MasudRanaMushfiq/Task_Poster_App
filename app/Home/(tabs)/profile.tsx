import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getAuth, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState, useCallback } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
  Platform,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../../../firebaseConfig';
import { LinearGradient } from 'expo-linear-gradient';

const ProfileScreen = () => {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const auth = getAuth();
  const currentUser = auth.currentUser;
  const router = useRouter();

  const fetchUserData = useCallback(async () => {
    try {
      if (!currentUser?.uid) {
        router.replace('/auth/login');
        return;
      }

      setLoading(true);

      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (userDoc.exists()) setUserData(userDoc.data());

      const adminDoc = await getDoc(doc(db, 'admins', currentUser.uid));
      setIsAdmin(adminDoc.exists());
    } catch (error) {
      console.error('Error fetching user data:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      await AsyncStorage.removeItem('user');
      router.replace('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to logout');
    }
  };

  const handleEdit = () => router.push('/profile/editprofile');
  const handleAdmin = () => router.push('/admin/dashboard');
  const handleComplain = () => router.push('/profile/complain');

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUserData();
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3B7CF5" />
      </View>
    );
  }

  return (
    <>
      {/* Header */}
      <LinearGradient
        colors={['#3B7CF5', '#5AD9D5']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.header,
          {
            paddingTop:
              (Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0) + 10,
          },
        ]}
      >
        <StatusBar backgroundColor="#3B7CF5" barStyle="light-content" />
        <Text style={styles.headerTitle}>Profile</Text>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#3B7CF5']} />
        }
      >
        {/* Compact Profile Section */}
        <View style={styles.profileSection}>
          <Ionicons name="person-circle" size={100} color="#3B7CF5" />
          <View style={styles.profileText}>
            <Text style={styles.userName}>{userData?.fullName || 'No Name'}</Text>
            {userData?.bio?.trim() && <Text style={styles.userBio}>{userData.bio}</Text>}
          </View>
        </View>

        {/* Edit Button */}
        <LinearGradient
          colors={['#3B7CF5', '#5AD9D5']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.editButton}
        >
          <TouchableOpacity onPress={handleEdit} style={{ width: '100%', alignItems: 'center' }}>
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Info Card */}
        <LinearGradient
          colors={['#3B7CF5', '#5AD9D5']}
          style={styles.infoCardGradient}
        >
          <View style={styles.infoCard}>
            <InfoRow label="Email" value={currentUser?.email || 'Not set'} />
            <InfoRow label="Phone" value={userData?.phone || 'Not set'} />
            <InfoRow label="NID" value={userData?.nid || 'Not set'} />
            <InfoRow label="Member Since" value={userData?.createdAt?.toDate?.().toLocaleDateString() || 'Unknown'} />
            <InfoRow
              label="Rating"
              value={
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={18} color="#e89d07" />
                  <Text style={styles.ratingText}>{(userData?.rating ?? 1).toFixed(2)}</Text>
                </View>
              }
            />
            <InfoRow
              label="Verified"
              value={
                <LinearGradient
                  colors={['#3B7CF5', '#5AD9D5']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.verifiedGradient}
                >
                  <View style={styles.verifiedContainer}>
                    {userData?.verified ? (
                      <>
                        <Ionicons name="checkmark-circle" size={18} color="#fff" />
                        <Text style={styles.verifiedText}>Verified</Text>
                      </>
                    ) : (
                      <>
                        <Ionicons name="close-circle" size={18} color="#fff" />
                        <Text style={styles.verifiedText}>Not Verified</Text>
                      </>
                    )}
                  </View>
                </LinearGradient>
              }
            />
          </View>
        </LinearGradient>

        {/* Buttons */}
        <View style={styles.buttonsRow}>
          <TouchableOpacity
            style={styles.outlineButton}
            onPress={() => router.push('/profile/history')}
          >
            <Text style={styles.outlineButtonText}>Work History</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Admin or Complain Button */}
        {isAdmin ? (
          <View style={[styles.buttonsRow, { marginTop: 0 }]}>
            <LinearGradient
              colors={['#3B7CF5', '#5AD9D5']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.adminButton, { flex: 1, marginHorizontal: 6 }]}
            >
              <TouchableOpacity
                onPress={handleAdmin}
                style={{ width: '100%', alignItems: 'center' }}
              >
                <Text style={styles.adminButtonText}>Admin Panel</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        ) : (
          <LinearGradient
            colors={['#3B7CF5', '#5AD9D5']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.contactButton, { width: '95%', marginTop: 20 }]}
          >
            <TouchableOpacity
              onPress={handleComplain}
              style={{ width: '100%', alignItems: 'center' }}
            >
              <Text style={styles.contactButtonText}>Give a Complain</Text>
            </TouchableOpacity>
          </LinearGradient>
        )}
      </ScrollView>
    </>
  );
};

const InfoRow = ({ label, value }: { label: string, value: any }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    {typeof value === 'string' ? <Text style={styles.infoValue}>{value}</Text> : value}
  </View>
);

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 16, alignItems: 'center', backgroundColor: '#E6F2FF' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#E6F2FF' },
  header: { width: '100%', paddingVertical: 20, alignItems: 'center', borderBottomLeftRadius: 18, borderBottomRightRadius: 18 },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: '700' },
  profileSection: { flexDirection: 'row', alignItems: 'center', marginBottom: -8, width: '100%' },
  profileText: { marginLeft: 16, flex: 1 },
  userName: { color: '#3a125d', fontSize: 22, fontWeight: '700', marginBottom: 4 },
  userBio: { color: '#544d4d', fontSize: 16, flexWrap: 'wrap' },
  editButton: { borderRadius: 24, marginVertical: 12, width: '60%', paddingVertical: 12 },
  editButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  contactButton: { borderRadius: 24, paddingVertical: 12 },
  contactButtonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  infoCardGradient: { borderRadius: 20, marginBottom: 20, marginTop: 30, width: '95%', padding: 2 },
  infoCard: { backgroundColor: '#fff', borderRadius: 18, padding: 16 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, alignItems: 'center' },
  infoLabel: { fontWeight: '600', fontSize: 16, color: '#3a125d' },
  infoValue: { fontSize: 16, color: '#544d4d' },
  ratingContainer: { flexDirection: 'row', alignItems: 'center' },
  ratingText: { marginLeft: 6, fontWeight: '600', fontSize: 16, color: '#544d4d' },
  verifiedGradient: { borderRadius: 16, paddingHorizontal: 10, paddingVertical: 4 },
  verifiedContainer: { flexDirection: 'row', alignItems: 'center' },
  verifiedText: { marginLeft: 6, fontWeight: '600', fontSize: 14, color: '#fff' },
  buttonsRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginVertical: 20 },
  outlineButton: { flex: 1, borderWidth: 1, borderColor: '#3B7CF5', paddingVertical: 12, borderRadius: 24, alignItems: 'center', marginHorizontal: 6 },
  outlineButtonText: { color: '#3B7CF5', fontSize: 16, fontWeight: '600' },
  logoutButton: { flex: 1, backgroundColor: '#ffebee', borderWidth: 1, borderColor: '#ed4956', borderRadius: 24, alignItems: 'center', paddingVertical: 12, marginHorizontal: 6 },
  logoutButtonText: { color: '#ed4956', fontSize: 16, fontWeight: '600' },
  adminButton: { paddingVertical: 14, borderRadius: 24, alignItems: 'center' },
  adminButtonText: { color: '#fff', fontSize: 18, fontWeight: '700' },
});

export default ProfileScreen;



