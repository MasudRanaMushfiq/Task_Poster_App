import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  StatusBar,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../../firebaseConfig';
import { doc, getDoc, updateDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { LinearGradient } from 'expo-linear-gradient';

export default function AcceptedSentNotification() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [work, setWork] = useState<any>(null);
  const [worker, setWorker] = useState<any>(null);
  const router = useRouter();
  const currentUser = getAuth().currentUser;

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const notifRef = doc(db, 'notifications', id);
        const notifSnap = await getDoc(notifRef);
        if (!notifSnap.exists()) {
          Alert.alert('Error', 'Notification not found');
          router.back();
          return;
        }

        await updateDoc(notifRef, { read: true });

        const notifData = notifSnap.data();
        const workId = notifData.workId;
        if (!workId) {
          Alert.alert('Error', 'Work ID not found');
          router.back();
          return;
        }

        const workSnap = await getDoc(doc(db, 'worked', workId));
        if (!workSnap.exists()) {
          Alert.alert('Error', 'Work data not found');
          router.back();
          return;
        }

        const workData = workSnap.data();
        setWork({ id: workSnap.id, ...workData });

        if (workData.acceptedBy) {
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

    fetchData();
  }, [id]);

  const completeWork = async () => {
    if (!work) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, 'worked', work.id), { status: 'completed' });

      if (work.acceptedBy) {
        const workerRef = doc(db, 'users', work.acceptedBy);
        const workerSnap = await getDoc(workerRef);
        if (workerSnap.exists()) {
          const currentWallet = workerSnap.data().wallet || 0;
          const amount = work.price || work.budget || 0;
          await updateDoc(workerRef, { wallet: currentWallet + amount });
        }

        await addDoc(collection(db, 'notifications'), {
          workId: work.id,
          toUserId: work.acceptedBy,
          fromUserId: currentUser?.uid || null,
          message: `Thank you for completing "${work.jobTitle}". Please collect your payment.`,
          type: 'completed',
          read: false,
          createdAt: serverTimestamp(),
        });
      }

      Alert.alert('Success', 'Work marked as completed and money added to worker wallet!');
      router.push({
        pathname: '/screen/rating',
        params: { workId: work.id, ratedUserId: work.acceptedBy },
      });
    } catch (err: any) {
      console.error(err);
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const rejectWork = async () => {
    if (!work) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, 'worked', work.id), { status: 'accepted' });

      // Added: Notify accepted user that work is not completed
      if (work.acceptedBy) {
        await addDoc(collection(db, 'notifications'), {
          workId: work.id,
          toUserId: work.acceptedBy,
          fromUserId: currentUser?.uid || null,
          message: `Your work "${work.jobTitle}" has been marked as not completed. Please complete it.`,
          type: 'rejected',
          read: false,
          createdAt: serverTimestamp(),
        });
      }

      Alert.alert('Work rejected and user notified');
      router.push('/Home');
    } catch (err: any) {
      console.error(err);
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3B7CF5" />
      </View>
    );

  if (!work) {
    return (
      <View style={styles.centered}>
        <Text>No work data available</Text>
      </View>
    );
  }

  const InfoBox = ({ label, value, gradient }: { label: string; value: string | number; gradient?: boolean }) => (
    <View style={{ marginBottom: 12 }}>
      <Text style={styles.label}>{label}</Text>
      {gradient ? (
        <LinearGradient colors={['#E6F2FF', '#DDEEFF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.valueBox}>
          <Text style={styles.value}>{value}</Text>
        </LinearGradient>
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

      {/* Header with status bar padding */}
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
        <LinearGradient colors={['#4A8FF0', '#65D4C9']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.cardBorder}>
          <View style={styles.card}>
            <Text style={styles.title}>{work.jobTitle}</Text>

            <InfoBox label="Description" value={work.description} gradient />
            <InfoBox label="Start Date" value={work.startDate?.toDate?.()?.toLocaleString?.() || '-'} />
            <InfoBox label="End Date" value={work.endDate?.toDate?.()?.toLocaleString?.() || '-'} />
            <InfoBox label="Budget" value={`৳${work.price || work.budget}`} />
            <InfoBox label="Worker" value={worker?.fullName || worker?.name || 'Unknown'} />
          </View>
        </LinearGradient>

        <View style={styles.btnRow}>
          <LinearGradient colors={['#1B5E20', '#2E7D32']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.btn}>
            <TouchableOpacity style={{ flex: 1 }} onPress={completeWork}>
              <Text style={styles.btnText}>Completed</Text>
            </TouchableOpacity>
          </LinearGradient>

          <LinearGradient colors={['#dc3545', '#F46C6C']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.btn}>
            <TouchableOpacity style={{ flex: 1 }} onPress={rejectWork}>
              <Text style={styles.btnText}>Not Completed</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, flexGrow: 1, backgroundColor: '#E6F2FF' },
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

  cardBorder: { borderRadius: 20, padding: 2, marginBottom: 16 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, elevation: 2 },

  title: { fontSize: 22, fontWeight: '700', marginBottom: 12, color: '#0D1F3C' },

  label: { fontSize: 14, fontWeight: '600', color: '#0D1F3C', marginBottom: 4 },
  valueBox: { padding: 12, borderRadius: 12, marginBottom: 4 },
  valueBoxLight: { padding: 12, borderRadius: 12, marginBottom: 4, backgroundColor: '#F0F4FF' },
  value: { fontSize: 16, fontWeight: '500', color: '#0D1F3C' },

  btnRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
  btn: { flex: 1, padding: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginHorizontal: 6 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});




