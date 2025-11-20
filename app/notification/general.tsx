import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { db } from '../../firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function NotificationMessage() {
  const { complainId, id } = useLocalSearchParams<{ complainId?: string; id?: string }>();
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchNotification = async () => {
      if (!id && !complainId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const notifRef = doc(db, 'notifications', id || complainId!);
        const notifSnap = await getDoc(notifRef);

        if (notifSnap.exists()) {
          const notifData = notifSnap.data();
          setMessage(notifData.message || 'No message available');

          // Mark notification as read if not already
          if (!notifData.read) {
            await updateDoc(notifRef, { read: true });
          }
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
  }, [id, complainId]);

  return (
    <View style={{ flex: 1, backgroundColor: '#f0f2f5' }}>
      {/* StatusBar */}
      <StatusBar
        backgroundColor="transparent"
        barStyle="light-content"
        translucent
      />

      {/* Header */}
      <LinearGradient
        colors={['#4A8FF0', '#65D4C9']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: (Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 20) + 8 }]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>General Notification</Text>
      </LinearGradient>

      {/* Body */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#3B7CF5" />
        </View>
      ) : !message ? (
        <View style={styles.centered}>
          <Text style={styles.infoText}>No message found.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.container}>
          <LinearGradient
            colors={['#E6F2FF', '#DDEEFF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.card}
          >
            {complainId && (
              <Text style={styles.complainIdText}>Complain ID: {complainId}</Text>
            )}
            <Text style={styles.messageText}>{message}</Text>
          </LinearGradient>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    elevation: 4,
    justifyContent: 'center',
    position: 'relative',
  },
  backBtn: {
    position: 'absolute',
    left: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
  },
  container: {
    padding: 16,
    flexGrow: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 16,
    color: '#606770',
    textAlign: 'center',
  },
  card: {
    borderRadius: 12,
    padding: 20,
    elevation: 2,
  },
  complainIdText: {
    fontSize: 14,
    color: '#3a125d',
    fontWeight: '600',
    marginBottom: 8,
  },
  messageText: {
    fontSize: 16,
    color: '#0D1F3C',
    lineHeight: 22,
  },
});



