import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { db } from '../../firebaseConfig';
import { doc, getDoc, Timestamp, updateDoc } from 'firebase/firestore';
import { LinearGradient } from 'expo-linear-gradient';

export default function CompletedWork() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [work, setWork] = useState<any>(null);
  const [poster, setPoster] = useState<any>(null);
  const [worker, setWorker] = useState<any>(null);
  const router = useRouter();

  const formatDate = (ts: any) => {
    if (!ts) return 'N/A';
    if (ts instanceof Timestamp) return ts.toDate().toLocaleString();
    if (ts.toDate) return ts.toDate().toLocaleString();
    return ts.toString();
  };

  useEffect(() => {
    if (!id) {
      Alert.alert('Error', 'No notification ID provided');
      router.back();
      return;
    }

    const fetchWork = async () => {
      setLoading(true);
      try {
        const notifRef = doc(db, 'notifications', id);
        const notifSnap = await getDoc(notifRef);
        if (!notifSnap.exists()) throw new Error('Notification not found');
        const notifData = notifSnap.data();
        if (!notifData.read) await updateDoc(notifRef, { read: true });

        const workId = notifData?.workId;
        if (!workId) throw new Error('Work ID not found in notification');

        const workRef = doc(db, 'worked', workId);
        const workSnap = await getDoc(workRef);
        if (!workSnap.exists()) throw new Error('Work not found');
        const workData = { id: workSnap.id, ...workSnap.data() };
        setWork(workData);

        if (workData?.userId) {
          const posterSnap = await getDoc(doc(db, 'users', workData.userId));
          if (posterSnap.exists()) setPoster(posterSnap.data());
        }

        if (workData?.acceptedBy) {
          const workerSnap = await getDoc(doc(db, 'users', workData.acceptedBy));
          if (workerSnap.exists()) setWorker(workerSnap.data());
        }
      } catch (err: any) {
        console.error(err);
        Alert.alert('Error', err.message);
        router.back();
      } finally {
        setLoading(false);
      }
    };

    fetchWork();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3B7CF5" />
      </View>
    );
  }

  if (!work) {
    return (
      <View style={styles.centered}>
        <Text>No work data available.</Text>
      </View>
    );
  }

  const InfoBox = ({
    label,
    value,
    gradient,
    onPress,
  }: {
    label: string;
    value: string | number;
    gradient?: boolean;
    onPress?: () => void;
  }) => (
    <View style={{ marginBottom: 8 }}>
      <Text style={styles.label}>{label}</Text>
      {gradient ? (
        <LinearGradient colors={['#E6F2FF', '#DDEEFF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.valueBox}>
          <Text style={styles.value}>{value}</Text>
        </LinearGradient>
      ) : onPress ? (
        <TouchableOpacity onPress={onPress} style={styles.valueBoxLight}>
          <Text style={[styles.value, { color: '#3B7CF5', fontWeight: '700' }]}>{value}</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.valueBoxLight}>
          <Text style={styles.value}>{value}</Text>
        </View>
      )}
    </View>
  );

  return (
    <>
      <StatusBar backgroundColor="#4A8FF0" barStyle="light-content" />

      {/* Header with padding for status bar */}
      <LinearGradient
        colors={['#4A8FF0', '#65D4C9']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[
          styles.header,
          { paddingTop: (Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 20) + 10 },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Back</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.container}>
        {/* Greetings Banner */}
        <LinearGradient colors={['#3B7CF5', '#5AD9D5']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.greeting}>
          <Text style={styles.greetingText}>
            Hey <Text style={styles.highlight}>{worker?.fullName || worker?.name || 'User'}</Text>, you have got{' '}
            <Text style={styles.highlight}>৳{work.price || work.budget || 0}</Text> money, Congrats! Please Collect it.
          </Text>
        </LinearGradient>

        {/* Compact Work Card */}
        <LinearGradient colors={['#4A8FF0', '#65D4C9']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.cardBorder}>
          <View style={styles.card}>
            <Text style={styles.title}>{work.jobTitle || 'Untitled Work'}</Text>

            <InfoBox label="Description" value={work.description || 'No description provided.'} gradient />
            <InfoBox label="Budget" value={`৳${work.budget || work.price || 0}`} />
            <InfoBox label="Start Date" value={formatDate(work.startDate)} />
            <InfoBox label="End Date" value={formatDate(work.endDate)} />
            <InfoBox
              label="Posted By"
              value={poster?.fullName || poster?.name || 'Unknown'}
              onPress={() => router.push(`/screen/viewuser?id=${work.userId}`)}
            />
          </View>
        </LinearGradient>

        {/* Bottom Buttons */}
        <View style={styles.btnRow}>
          <LinearGradient colors={['#3B7CF5', '#5AD9D5']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.btn}>
            <TouchableOpacity style={{ flex: 1 }} onPress={() => router.push('/Home')}>
              <Text style={styles.btnText}>Home</Text>
            </TouchableOpacity>
          </LinearGradient>

          <LinearGradient colors={['#3B7CF5', '#5AD9D5']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.btn}>
            <TouchableOpacity style={{ flex: 1 }} onPress={() => router.push('/screen/wallet')}>
              <Text style={styles.btnText}>Wallet</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 16, backgroundColor: '#E6F2FF' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  header: {
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '700', marginLeft: 10 },
  backButton: { padding: 4 },

  greeting: { padding: 14, borderRadius: 16, marginBottom: 14 },
  greetingText: { color: '#fff', fontSize: 16, fontWeight: '600', textAlign: 'center' },
  highlight: { fontWeight: '700', color: '#FFD700' },

  cardBorder: { borderRadius: 18, padding: 1, marginBottom: 16 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 12, elevation: 2 },

  title: { fontSize: 20, fontWeight: '700', marginBottom: 10, color: '#0D1F3C' },

  label: { fontSize: 13, fontWeight: '600', color: '#0D1F3C', marginBottom: 2 },
  valueBox: { padding: 10, borderRadius: 10, marginBottom: 4 },
  valueBoxLight: { padding: 10, borderRadius: 10, marginBottom: 4, backgroundColor: '#F0F4FF' },
  value: { fontSize: 15, fontWeight: '500', color: '#0D1F3C' },

  btnRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 14 },
  btn: { flex: 1, padding: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginHorizontal: 6 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});



