import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  StatusBar,
  TouchableOpacity,
  SafeAreaView,
  Platform,
} from 'react-native';
import { getAuth } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../../firebaseConfig';
import { doc, getDoc, collection, query, orderBy, getDocs } from 'firebase/firestore';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function WalletScreen() {
  const [loading, setLoading] = useState(true);
  const [walletBalance, setWalletBalance] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const auth = getAuth();
  const currentUser = auth.currentUser;

  useEffect(() => {
    if (!currentUser) {
      Alert.alert('Error', 'User not logged in');
      return;
    }

    const fetchWallet = async () => {
      setLoading(true);
      try {
        const userSnap = await getDoc(doc(db, 'users', currentUser.uid));
        if (!userSnap.exists()) throw new Error('User not found');
        const userData = userSnap.data();
        setWalletBalance(userData.wallet || 0);

        const transCol = collection(db, 'users', currentUser.uid, 'transactions');
        const transQuery = query(transCol, orderBy('timestamp', 'desc'));
        const transSnap = await getDocs(transQuery);
        const transList: any[] = [];
        transSnap.forEach((doc) => transList.push({ id: doc.id, ...doc.data() }));
        setTransactions(transList);
      } catch (err: any) {
        console.error(err);
        Alert.alert('Error', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWallet();
  }, []);

  const handleWithdraw = () => {
    Alert.alert('Withdraw', 'Withdrawal feature is not implemented yet.');
  };

  const goToHome = () => {
    router.push('/Home');
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3B7CF5" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#E6F2FF' }}>
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
        <Text style={styles.headerTitle}>Wallet</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.container}>
        {/* Wallet Balance Card */}
        <LinearGradient colors={['#3B7CF5', '#5AD9D5']} style={styles.gradientCard}>
          <View style={styles.card}>
            <View style={styles.walletRow}>
              <View>
                <Text style={styles.headerText}>Wallet Balance</Text>
                <Text style={styles.balance}>৳{walletBalance.toFixed(2)}</Text>
              </View>

              {/* Gradient Withdraw Button */}
              <TouchableOpacity style={{ borderRadius: 6, overflow: 'hidden' }} onPress={handleWithdraw}>
                <LinearGradient
                  colors={['#3B7CF5', '#5AD9D5']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.withdrawBtn}
                >
                  <Text style={styles.withdrawText}>Withdraw</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        {/* Transactions */}
        <View style={styles.card}>
          <Text style={styles.headerText}>Transactions</Text>
          {transactions.length === 0 ? (
            <Text style={styles.noTrans}>No withdraw transactions yet.</Text>
          ) : (
            transactions.map((t) => (
              <View key={t.id} style={styles.transaction}>
                <Text style={styles.transText}>{t.type || 'Unknown'}</Text>
                <Text style={styles.transAmount}>৳{t.amount || 0}</Text>
                <Text style={styles.transDate}>
                  {t.timestamp?.toDate ? t.timestamp.toDate().toLocaleString() : t.timestamp}
                </Text>
              </View>
            ))
          )}
        </View>

        {/* Gradient Go to Home Button */}
        <TouchableOpacity style={{ borderRadius: 12, overflow: 'hidden', marginBottom: 20 }} onPress={goToHome}>
          <LinearGradient
            colors={['#4A8FF0', '#65D4C9']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.homeBtn}
          >
            <Text style={styles.homeText}>Go to Home</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
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
    elevation: 4,
  },
  backButton: { padding: 4 },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '700', marginLeft: 12 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
  },
  gradientCard: {
    borderRadius: 12,
    marginBottom: 20,
    padding: 2, 
  },
  walletRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerText: { fontSize: 20, fontWeight: '700', color: '#1877F2', marginBottom: 12 },
  balance: { fontSize: 28, fontWeight: '700', color: '#28a745' },
  withdrawBtn: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 6, alignItems: 'center' },
  withdrawText: { fontSize: 20, color: '#fff', fontWeight: '700' },
  noTrans: { color: '#555', fontStyle: 'italic' },
  transaction: { borderBottomWidth: 0.5, borderColor: '#ddd', paddingVertical: 10 },
  transText: { fontWeight: '600', color: '#333' },
  transAmount: { fontWeight: '700', color: '#28a745', marginTop: 2 },
  transDate: { fontSize: 12, color: '#777', marginTop: 2 },
  homeBtn: { paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 30 },
  homeText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});



