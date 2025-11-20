import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Alert,
  StatusBar,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { getAuth } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const CompletedWorksScreen = () => {
  const [completedWorks, setCompletedWorks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const auth = getAuth();
  const db = getFirestore();
  const router = useRouter();

  useEffect(() => {
    const fetchCompletedWorks = async () => {
      try {
        const uid = auth.currentUser?.uid;
        if (!uid) {
          router.replace('/auth/login');
          return;
        }
        const userDoc = await getDoc(doc(db, 'users', uid));
        if (!userDoc.exists()) {
          Alert.alert('Error', 'User data not found');
          return;
        }
        const userData = userDoc.data();
        const acceptedIds = userData.acceptedWorks || [];

        const works = await Promise.all(
          acceptedIds.map(async (id: string) => {
            try {
              const docSnap = await getDoc(doc(db, 'worked', id));
              if (docSnap.exists()) {
                const data = docSnap.data();
                if (data.status === 'completed') {
                  return {
                    id: docSnap.id,
                    ...data,
                    createdAt: data.createdAt?.toDate?.() || null,
                  };
                }
              }
              return null;
            } catch (error) {
              console.error(`Error fetching work ${id}:`, error);
              return null;
            }
          })
        );

        setCompletedWorks(works.filter(Boolean));
      } catch (error) {
        console.error('Error fetching completed works:', error);
        Alert.alert('Error', 'Failed to fetch completed works');
      } finally {
        setLoading(false);
      }
    };

    fetchCompletedWorks();
  }, []);

  const renderWorkCard = (work: any) => (
    <LinearGradient
      key={work.id}
      colors={['#4A8FF0', '#65D4C9']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.cardGradient}
    >
      <View style={styles.workCard}>
        <Text style={styles.workTitle}>{work.jobTitle}</Text>
        <Text style={styles.workCategory}>{work.category}</Text>
        <Text style={styles.workDescription} numberOfLines={3} ellipsizeMode="tail">
          {work.description}
        </Text>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Price:</Text>
          <Text style={styles.detailValue}>৳{work.price}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Location:</Text>
          <Text style={styles.detailValue}>{work.location}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Status:</Text>
          <Text style={[styles.detailValue, styles.completedStatus]}>Completed</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Posted on:</Text>
          <Text style={styles.detailValue}>
            {work.createdAt?.toLocaleDateString() || 'N/A'}
          </Text>
        </View>
      </View>
    </LinearGradient>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3B7CF5" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#E6F2FF' }}>
      {/* StatusBar */}
      <StatusBar backgroundColor="#4A8FF0" barStyle="light-content" />

      {/* Gradient Header with top padding for status bar */}
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
        <Text style={styles.headerTitle}>Your Completed Works</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ ...styles.container, paddingTop: 20 }}>
        {completedWorks.length === 0 ? (
          <Text style={styles.noWorksText}>No completed works found</Text>
        ) : (
          completedWorks.map(renderWorkCard)
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    alignItems: 'center',
    paddingBottom: 16,
    backgroundColor: 'transparent',
  },
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
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  backButton: { padding: 4 },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '700', marginLeft: 12 },

  noWorksText: {
    fontSize: 16,
    color: '#606770',
    marginVertical: 20,
    alignSelf: 'center',
  },
  cardGradient: {
    width: '100%',
    borderRadius: 20,
    marginBottom: 14,
    padding: 2,
  },
  workCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
  },
  workTitle: { fontSize: 18, fontWeight: '700', color: '#1c1e21', marginBottom: 4 },
  workCategory: { fontSize: 13, color: '#3a125d', fontStyle: 'italic', marginBottom: 8 },
  workDescription: { fontSize: 14, color: '#4b4f56', marginBottom: 10, lineHeight: 20 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  detailLabel: { fontSize: 13, fontWeight: '600', color: '#606770' },
  detailValue: { fontSize: 13, color: '#4b4f56' },
  completedStatus: { color: '#4CAF50', fontWeight: '700' },
});

export default CompletedWorksScreen;


