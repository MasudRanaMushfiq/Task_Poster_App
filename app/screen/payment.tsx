import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StatusBar,
  SafeAreaView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, getDoc, updateDoc, addDoc, collection, Timestamp } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { getAuth } from 'firebase/auth';
import { LinearGradient } from 'expo-linear-gradient';

export default function PaymentScreen() {
  const { workId, toUserId } = useLocalSearchParams<{ workId: string; toUserId: string }>();
  const router = useRouter();
  const currentUser = getAuth().currentUser;

  const [workData, setWorkData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [transactionId, setTransactionId] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!workId) return;

    const fetchWork = async () => {
      setLoading(true);
      try {
        const workSnap = await getDoc(doc(db, 'worked', workId));
        if (workSnap.exists()) {
          setWorkData(workSnap.data());
        } else {
          Alert.alert('Error', 'Work not found');
          router.back();
        }
      } catch (error) {
        console.error('Error fetching work:', error);
        Alert.alert('Error', 'Failed to load work');
      } finally {
        setLoading(false);
      }
    };

    fetchWork();
  }, [workId]);

  const handlePaymentCompleted = async () => {
    if (!transactionId.trim()) {
      Alert.alert('Error', 'Please enter transaction ID');
      return;
    }
    if (!currentUser) {
      Alert.alert('Error', 'User not logged in');
      return;
    }

    setProcessing(true);

    try {
      await updateDoc(doc(db, 'worked', workId), {
        status: 'accepted',
        acceptedAt: Timestamp.now(),
        transactionId: transactionId.trim(),
      });

      if (toUserId) {
        await addDoc(collection(db, 'notifications'), {
          toUserId: toUserId,
          fromUserId: currentUser.uid,
          workId,
          message: `Your work "${workData.jobTitle}" has been accepted. Now Complete the Work`,
          createdAt: Timestamp.now(),
          read: false,
        });
      }

      Alert.alert('Success', 'Payment completed and work accepted!');
      router.replace('/Home/(tabs)');
    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert('Error', 'Failed to complete payment');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3B7CF5" />
      </View>
    );
  }

  if (!workData) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: '#F44336' }}>Work not found</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.background}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      {/* Gradient Header */}
      <LinearGradient
        colors={['#4A8FF0', '#65D4C9']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.header, { paddingTop: (Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 20) + 8 }]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>Payment Details</Text>

        {/* Work Details */}
        <View style={styles.card}>
          <Text style={styles.title}>{workData.jobTitle}</Text>
          <Text style={styles.info}><Text style={styles.bold}>Description: </Text>{workData.description}</Text>
          <Text style={styles.info}><Text style={styles.bold}>Location: </Text>{workData.location}</Text>
          <Text style={styles.info}><Text style={styles.bold}>Start Date: </Text>{workData.startDate?.toDate().toLocaleDateString()}</Text>
          <Text style={styles.info}><Text style={styles.bold}>End Date: </Text>{workData.endDate?.toDate().toLocaleDateString()}</Text>
        </View>

        {/* Payment Amount */}
        <LinearGradient colors={['#3B7CF5', '#5AD9D5']} style={styles.amountBox}>
          <Text style={styles.amountText}>৳{workData.price}</Text>
        </LinearGradient>

        {/* Transaction ID */}
        <TextInput
          placeholder="Enter Transaction ID"
          placeholderTextColor="#636060"
          value={transactionId}
          onChangeText={setTransactionId}
          style={styles.input}
        />

        {/* Payment Button */}
        <TouchableOpacity
          style={[styles.payButton, processing && { backgroundColor: '#999' }]}
          onPress={handlePaymentCompleted}
          disabled={processing}
        >
          <Text style={styles.payButtonText}>{processing ? 'Processing...' : 'Payment Completed'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#E6F2FF',
    flexGrow: 1,
  },
  background: { flex: 1, backgroundColor: '#E6F2FF' },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E6F2FF',
  },
  header: {
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    elevation: 4,
  },
  backButton: { padding: 4 },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '700', marginLeft: 12 },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: '#3B7CF5',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 10,
    color: '#3B7CF5',
  },
  info: {
    fontSize: 16,
    color: '#544d4d',
    marginBottom: 6,
  },
  bold: {
    fontWeight: '700',
  },
  amountBox: {
    borderRadius: 20,
    paddingVertical: 24,
    marginBottom: 20,
    alignItems: 'center',
  },
  amountText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
  },
  input: {
    height: 50,
    borderColor: '#3B7CF5',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 20,
    backgroundColor: '#fff',
    color: '#544d4d',
  },
  payButton: {
    backgroundColor: '#3B7CF5',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  payButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});


