import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
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

export default function AcceptedNotification() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [work, setWork] = useState<any>(null);
  const [poster, setPoster] = useState<any>(null);
  const [worker, setWorker] = useState<any>(null);
  const [showPhone, setShowPhone] = useState(false);
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
          router.back();
          return;
        }

        await updateDoc(notifRef, { read: true });

        const notifData = notifSnap.data();
        const workId = notifData.workId;
        if (!workId) {
          router.back();
          return;
        }

        const workSnap = await getDoc(doc(db, 'worked', workId));
        if (!workSnap.exists()) {
          router.back();
          return;
        }

        const workData = workSnap.data();
        setWork({ id: workSnap.id, ...workData });

        if (workData.userId) {
          const posterSnap = await getDoc(doc(db, 'users', workData.userId));
          if (posterSnap.exists()) setPoster(posterSnap.data());
        }

        if (workData.acceptedBy) {
          const workerSnap = await getDoc(doc(db, 'users', workData.acceptedBy));
          if (workerSnap.exists()) setWorker(workerSnap.data());
        }

      } catch (err) {
        console.error(err);
        router.back();
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleContact = () => setShowPhone(true);

  const handleComplete = async () => {
    if (!work || !currentUser) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, 'worked', work.id), { status: 'completed_sent' });

      if (work.userId) {
        await addDoc(collection(db, 'notifications'), {
          workId: work.id,
          toUserId: work.userId,
          fromUserId: currentUser.uid,
          message: `The work "${work.jobTitle}" has been completed. Please confirm it.`,
          type: 'completed_sent',
          read: false,
          createdAt: serverTimestamp(),
        });
      }

      router.push('/Home');
    } catch (err: any) {
      console.error(err);
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

  if (!work) {
    return (
      <View style={styles.centered}>
        <Text>No work data available.</Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar backgroundColor="#4A8FF0" barStyle="light-content" />

      {/* Header */}
      <LinearGradient 
        colors={['#4A8FF0', '#65D4C9']} 
        start={{ x: 0, y: 0 }} 
        end={{ x: 1, y: 0 }} 
        style={[
          styles.header,
          {
            paddingTop: (Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 20) + 10,
          },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Back</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.container}>
        {/* Work Card */}
        <LinearGradient colors={['#4A8FF0', '#65D4C9']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.cardBorder}>
          <View style={styles.card}>
            <Text style={styles.title}>{work.jobTitle}</Text>
            <LinearGradient colors={['#E6F2FF', '#DDEEFF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.valueBox}>
              <Text style={styles.value}>{work.description}</Text>
            </LinearGradient>

            <View style={{ marginTop: 8 }}>
              <Text style={styles.label}>Start:</Text>
              <View style={styles.valueBoxLight}>
                <Text style={styles.value}>{work.startDate?.toDate?.()?.toLocaleString?.()}</Text>
              </View>
            </View>

            <View style={{ marginTop: 8 }}>
              <Text style={styles.label}>End:</Text>
              <View style={styles.valueBoxLight}>
                <Text style={styles.value}>{work.endDate?.toDate?.()?.toLocaleString?.()}</Text>
              </View>
            </View>

            <View style={{ marginTop: 8 }}>
              <Text style={styles.label}>Budget:</Text>
              <View style={styles.valueBoxLight}>
                <Text style={styles.value}>৳{work.budget || work.price}</Text>
              </View>
            </View>

            {poster && (
              <View style={{ marginTop: 8 }}>
                <Text style={styles.label}>Posted By:</Text>
                <TouchableOpacity
                  style={styles.valueBoxLight}
                  onPress={() => router.push(`/screen/viewuser?id=${work.userId}`)}
                >
                  <Text style={[styles.value, { color: '#3B7CF5', fontWeight: '700' }]}>
                    {poster.name || poster.fullName}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </LinearGradient>

        {/* Buttons */}
        <View style={styles.actions}>
          <LinearGradient colors={['#3B7CF5', '#5AD9D5']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.btn}>
            <TouchableOpacity style={{ flex: 1 }} onPress={handleContact}>
              <Text style={styles.btnText}>Contact</Text>
            </TouchableOpacity>
          </LinearGradient>

          <LinearGradient colors={['#1B5E20', '#2E7D32']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.btn}>
            <TouchableOpacity style={{ flex: 1 }} onPress={handleComplete}>
              <Text style={styles.btnText}>Complete</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {showPhone && poster?.phone && (
          <Text style={styles.phoneText}>Poster Phone: {poster.phone}</Text>
        )}
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

  cardBorder: { borderRadius: 18, padding: 1, marginBottom: 16 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 12, elevation: 2 },

  title: { fontSize: 20, fontWeight: '700', marginBottom: 10, color: '#0D1F3C' },

  label: { fontSize: 13, fontWeight: '600', color: '#0D1F3C', marginBottom: 2 },
  valueBox: { padding: 10, borderRadius: 10, marginBottom: 4 },
  valueBoxLight: { padding: 10, borderRadius: 10, marginBottom: 4, backgroundColor: '#F0F4FF' },
  value: { fontSize: 15, fontWeight: '500', color: '#0D1F3C' },

  actions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  btn: { flex: 1, padding: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginHorizontal: 6 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },

  phoneText: { marginTop: 12, fontSize: 16, color: '#1877F2', textAlign: 'center' },
});


