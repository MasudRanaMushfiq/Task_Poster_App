import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  ColorValue,
  StatusBar,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { db } from '../../firebaseConfig';
import {
  doc,
  getDoc,
  updateDoc,
  addDoc,
  collection,
  serverTimestamp,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { LinearGradient } from 'expo-linear-gradient';

export default function AcceptNotification() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [work, setWork] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [workId, setWorkId] = useState<string | null>(null);
  const [acceptedUser, setAcceptedUser] = useState<any>(null);
  const [ownerUser, setOwnerUser] = useState<any>(null);
  const [acceptedUID, setAcceptedUID] = useState<string | null>(null);
  const [ownerUID, setOwnerUID] = useState<string | null>(null);
  const router = useRouter();
  const currentUser = getAuth().currentUser;

  const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

  useEffect(() => {
    if (!id) return;
    const fetchNotification = async () => {
      setLoading(true);
      try {
        const notifRef = doc(db, 'notifications', id);
        const notifSnap = await getDoc(notifRef);
        if (notifSnap.exists()) {
          const notifData = notifSnap.data();
          setWorkId(notifData.workId);
          await updateDoc(notifRef, { read: true });
        } else {
          Alert.alert('Error', 'Notification not found');
          router.back();
        }
      } catch (err: any) {
        Alert.alert('Error', err.message);
        router.back();
      } finally {
        setLoading(false);
      }
    };
    fetchNotification();
  }, [id]);

  useEffect(() => {
    if (!workId) return;
    const fetchWork = async () => {
      setLoading(true);
      try {
        const snap = await getDoc(doc(db, 'worked', workId));
        if (snap.exists()) {
          const workData = snap.data();
          setWork(workData);

          setOwnerUID(workData.ownerId || workData.userId || null);
          setAcceptedUID(workData.acceptedBy || null);

          if (workData.acceptedBy) {
            const userSnap = await getDoc(doc(db, 'users', workData.acceptedBy));
            if (userSnap.exists()) setAcceptedUser(userSnap.data());
          }

          const ownerId = workData.ownerId || workData.userId;
          if (ownerId) {
            const ownerSnap = await getDoc(doc(db, 'users', ownerId));
            if (ownerSnap.exists()) setOwnerUser(ownerSnap.data());
          }
        } else {
          Alert.alert('Error', 'Work not found');
          router.back();
        }
      } catch (err: any) {
        console.error(err);
        Alert.alert('Error', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchWork();
  }, [workId]);

  const grantWork = async () => {
    if (!workId || !acceptedUID) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, 'worked', workId), { status: 'accepted' });
      if (id) await updateDoc(doc(db, 'notifications', id), { read: true });

      await addDoc(collection(db, 'notifications'), {
        message: `You have been granted the work: "${work.jobTitle}", Do the work now.`,
        type: 'accepted',
        workId: workId,
        fromUserId: ownerUID || '',
        toUserId: acceptedUID,
        createdAt: serverTimestamp(),
        read: false,
      });

      Alert.alert('Success', 'Work granted and user notified.');
      router.push(`/screen/payment?workId=${workId}`);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const rejectUser = async () => {
    if (!workId || !acceptedUID) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, 'worked', workId), { status: 'active', acceptedBy: null });

      // New: send notification to rejected user
      await addDoc(collection(db, 'notifications'), {
        message: `Your application for "${work.jobTitle}" has been rejected.`,
        type: 'rejected',
        workId: workId,
        fromUserId: ownerUID || '',
        toUserId: acceptedUID,
        createdAt: serverTimestamp(),
        read: false,
      });

      Alert.alert('User rejected and notified.');
      router.push('/Home');
    } catch (err: any) {
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
  if (!work)
    return (
      <View style={styles.centered}>
        <Text>No work found for this notification.</Text>
      </View>
    );

  const DetailBox = ({ value, colors }: { value: string | number; colors: readonly [ColorValue, ColorValue, ...ColorValue[]] }) => (
    <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.detailBox}>
      <Text style={styles.detailValue}>{value}</Text>
    </LinearGradient>
  );

  return (
    <>
      <StatusBar backgroundColor="#4A8FF0" barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient
        colors={['#4A8FF0', '#65D4C9']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
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
        <LinearGradient
          colors={['#4A8FF0', '#65D4C9']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardBorder}
        >
          <View style={styles.card}>
            <Text style={styles.title}>{work.jobTitle}</Text>
            <DetailBox value={work.description} colors={['#E6F2FF', '#DDEEFF']} />

            {/* Small labels for status, budget, and date */}
            <View style={styles.labelTag}>
              <Text style={styles.labelText}>Status</Text>
              <DetailBox value={capitalize(work.status)} colors={['#F0F4FF', '#E0EBFF']} />
            </View>

            <View style={styles.labelTag}>
              <Text style={styles.labelText}>Budget</Text>
              <DetailBox value={work.budget} colors={['#FFF4E6', '#FFEFD9']} />
            </View>

            <View style={styles.labelTag}>
              <Text style={styles.labelText}>Created At</Text>
              <DetailBox value={work.createdAt?.toDate?.()?.toLocaleString?.() || '-'} colors={['#F0FFF0', '#DFFFE6']} />
            </View>
          </View>
        </LinearGradient>

        {/* Accepted By Card */}
        {acceptedUser && (
          <LinearGradient
            colors={['#B0C4FF', '#7095FF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.acceptedCard}
          >
            <Text style={styles.acceptedLabel}>Accepted By:</Text>
            <View style={styles.acceptedContent}>
              <Text style={styles.acceptedName}>{acceptedUser.name || acceptedUser.fullName}</Text>
              <LinearGradient
                colors={['#3B7CF5', '#5AD9D5']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.viewUserBorder}
              >
                <TouchableOpacity
                  style={styles.viewUserBtnSolid}
                  onPress={() => router.push(`/screen/viewuser?id=${acceptedUID}`)}
                >
                  <Text style={styles.viewUserText}>View User</Text>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          </LinearGradient>
        )}

        <View style={styles.actions}>
          <LinearGradient
            colors={['#1B5E20', '#2E7D32']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.btn}
          >
            <TouchableOpacity style={{ flex: 1 }} onPress={grantWork}>
              <Text style={styles.btnText}>Grant Work</Text>
            </TouchableOpacity>
          </LinearGradient>

          <LinearGradient
            colors={['#dc3545', '#F46C6C']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.btn}
          >
            <TouchableOpacity style={{ flex: 1 }} onPress={rejectUser}>
              <Text style={styles.btnText}>Reject User</Text>
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
  header: { width: '100%', paddingVertical: 18, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', borderBottomLeftRadius: 18, borderBottomRightRadius: 18 },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '700', marginLeft: 10 },
  backButton: { padding: 4 },

  cardBorder: { borderRadius: 20, padding: 2, marginBottom: 16 },
  card: { backgroundColor: '#fff', borderRadius: 18, padding: 16 },

  title: { fontSize: 22, fontWeight: '700', marginBottom: 12, color: '#0D1F3C' },

  detailBox: { padding: 12, borderRadius: 12, marginBottom: 10 },
  detailValue: { fontSize: 16, fontWeight: '600', color: '#0D1F3C', marginTop: 2 },

  labelTag: { marginBottom: 10 },
  labelText: { fontSize: 12, fontWeight: '500', color: '#0D1F3C', marginBottom: 4 },

  acceptedCard: { padding: 16, borderRadius: 16, marginBottom: 16 },
  acceptedLabel: { fontSize: 14, fontWeight: '600', color: '#0D1F3C', marginBottom: 6 },
  acceptedContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  acceptedName: { fontWeight: '800', fontSize: 18, marginLeft: 6, color: '#0803ffff' },

  viewUserBorder: { borderRadius: 12, padding: 2 },
  viewUserBtnSolid: { backgroundColor: '#fff', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 10 },
  viewUserText: { color: '#3B7CF5', fontWeight: '600', fontSize: 16, textAlign: 'center' },

  actions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  btn: { flex: 1, padding: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginHorizontal: 6 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});



