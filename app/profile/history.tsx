import React, { useEffect, useState, JSX } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native';
import { getAuth } from 'firebase/auth';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { getFirestore, doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const DashboardScreen = () => {
  const [loading, setLoading] = useState(true);
  const [postedCount, setPostedCount] = useState(0);
  const [acceptedCount, setAcceptedCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [complaintsCount, setComplaintsCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [profileRating, setProfileRating] = useState(0);

  const auth = getAuth();
  const db = getFirestore();
  const router = useRouter();

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const uid = auth.currentUser?.uid;
        if (!uid) {
          router.replace('/auth/login');
          return;
        }

        const userDoc = await getDoc(doc(db, 'users', uid));
        if (!userDoc.exists()) {
          alert('User data not found');
          return;
        }
        const userData = userDoc.data();

        setPostedCount(userData.postedWorks?.length || 0);
        setAcceptedCount(userData.acceptedWorks?.length || 0);
        setProfileRating(userData.rating ?? 0);

        const pendingQuery = query(
          collection(db, 'worked'),
          where('acceptedBy', '==', uid),
          where('status', 'in', ['accepted', 'completed_sent'])
        );
        const pendingSnapshot = await getDocs(pendingQuery);
        setPendingCount(pendingSnapshot.size);

        const completedQuery = query(
          collection(db, 'worked'),
          where('acceptedBy', '==', uid),
          where('status', '==', 'completed')
        );
        const completedSnapshot = await getDocs(completedQuery);
        setCompletedCount(completedSnapshot.size);

        const complaintsQuery = query(
          collection(db, 'complaints'),
          where('userId', '==', uid)
        );
        const complaintsSnapshot = await getDocs(complaintsQuery);
        setComplaintsCount(complaintsSnapshot.size);

      } catch (error) {
        console.error(error);
        alert('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3B7CF5" />
      </View>
    );
  }

  const MiniCard = ({ count, title, colors, icon }: { count: number; title: string; colors: string[]; icon?: JSX.Element }) => (
    <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.miniCard}>
      {icon && <View style={{ marginBottom: 4 }}>{icon}</View>}
      <Text style={styles.miniCardCount}>{count}</Text>
      <Text style={styles.miniCardTitle}>{title}</Text>
    </LinearGradient>
  );

  const ActionButton = ({ title, onPress, icon }: { title: string; onPress: () => void; icon?: JSX.Element }) => (
    <LinearGradient colors={['#4A8FF0', '#65D4C9']} style={styles.actionButton}>
      <TouchableOpacity style={styles.actionButtonInner} onPress={onPress} activeOpacity={0.8}>
        {icon && <View style={styles.buttonIcon}>{icon}</View>}
        <Text style={styles.actionButtonText}>{title}</Text>
      </TouchableOpacity>
    </LinearGradient>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#E6F2FF' }}>
      <StatusBar backgroundColor="#4A8FF0" barStyle="light-content" />

      {/* Header with paddingTop to avoid overlap */}
      <LinearGradient
        colors={['#4A8FF0', '#65D4C9']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[
          styles.header,
          { paddingTop: (Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 20) + 8 },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dashboard</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.container}>
        {/* Mini Cards Row */}
        <View style={styles.miniRow}>
          <MiniCard count={postedCount} title="Posted" colors={['#3a125d', '#5D2F9A']} />
          <MiniCard count={acceptedCount} title="Accepted" colors={['#1877F2', '#5AD9D5']} />
          <MiniCard count={pendingCount} title="Pending" colors={['#e89d07', '#f0c14b']} />
          <MiniCard count={completedCount} title="Completed" colors={['#4caf50', '#81c784']} />
          <MiniCard count={complaintsCount} title="Complaints" colors={['#f44336', '#f66b6b']} />
          <MiniCard
            count={parseFloat(profileRating.toFixed(1))}
            title="Rating"
            colors={['#3B7CF5', '#5AD9D5']}
            icon={<MaterialIcons name="star-rate" size={20} color="#fff" />}
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsRow}>
          <ActionButton
            title="Show Balance"
            icon={<Ionicons name="wallet-outline" size={20} color="#fff" />}
            onPress={() => router.push('/screen/wallet')}
          />
          <ActionButton title="Posted Works" icon={<MaterialIcons name="post-add" size={20} color="#fff" />} onPress={() => router.push('/profile/postedwork')} />
          <ActionButton title="Requested Works" icon={<Ionicons name="hand-left-outline" size={20} color="#fff" />} onPress={() => router.push('/profile/acceptedwork')} />
          <ActionButton title="Pending Works" icon={<Ionicons name="time-outline" size={20} color="#fff" />} onPress={() => router.push('/profile/pendingwork')} />
          <ActionButton title="Completed Works" icon={<Ionicons name="checkmark-done-outline" size={20} color="#fff" />} onPress={() => router.push('/profile/completedwork')} />
          <ActionButton title="View Complaints" icon={<Ionicons name="warning-outline" size={20} color="#fff" />} onPress={() => router.push('/profile/pendingwork')} />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { paddingVertical: 20, paddingHorizontal: 16, backgroundColor: '#E6F2FF' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#E6F2FF' },

  header: { width: '100%', paddingVertical: 16, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', borderBottomLeftRadius: 18, borderBottomRightRadius: 18 },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '700', marginLeft: 10 },
  backButton: { padding: 4 },

  miniRow: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', marginBottom: 20 },
  miniCard: { flexBasis: '30%', marginVertical: 6, borderRadius: 18, paddingVertical: 14, alignItems: 'center', justifyContent: 'center', elevation: 3 },
  miniCardCount: { fontSize: 20, fontWeight: '900', color: '#fff' },
  miniCardTitle: { fontSize: 12, fontWeight: '600', color: '#fff', marginTop: 4, textAlign: 'center' },

  actionsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 30 },
  actionButton: { width: '48%', borderRadius: 14, marginBottom: 12, elevation: 3 },
  actionButtonInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 14 },
  buttonIcon: { marginRight: 8 },
  actionButtonText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});

export default DashboardScreen;



