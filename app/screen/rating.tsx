import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  ActivityIndicator,
  StatusBar,
  SafeAreaView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { getAuth } from 'firebase/auth';
import { LinearGradient } from 'expo-linear-gradient';

export default function RatingScreen() {
  const { ratedUserId, workId } = useLocalSearchParams<{ ratedUserId: string; workId: string }>();
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [userName, setUserName] = useState('');
  const router = useRouter();
  const currentUser = getAuth().currentUser;

  useEffect(() => {
    if (!ratedUserId) {
      Alert.alert('Error', 'No user to rate');
      router.back();
      return;
    }

    async function fetchUser() {
      setLoading(true);
      try {
        const userDoc = await getDoc(doc(db, 'users', ratedUserId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserName(userData.fullName || userData.name || 'User');
        } else {
          Alert.alert('Error', 'User not found');
          router.back();
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        Alert.alert('Error', 'Failed to load user data');
        router.back();
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, [ratedUserId]);

  const submitRating = async () => {
    if (rating < 1 || rating > 5) {
      Alert.alert('Invalid Rating', 'Please select a rating between 1 and 5 stars.');
      return;
    }
    if (!currentUser) {
      Alert.alert('Error', 'You must be logged in to submit a rating.');
      return;
    }

    setLoading(true);
    try {
      const userRef = doc(db, 'users', ratedUserId);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        Alert.alert('Error', 'User not found.');
        setLoading(false);
        return;
      }
      const userData = userSnap.data();
      const oldRating = userData.rating || 0;
      const oldRatingCount = userData.ratingCount || 0;
      const newRatingCount = oldRatingCount + 1;
      const newRating = (oldRating * oldRatingCount + rating) / newRatingCount;

      await updateDoc(userRef, {
        rating: newRating,
        ratingCount: newRatingCount,
        reviews: arrayUnion({
          reviewerId: currentUser.uid,
          rating,
          comment,
          timestamp: new Date(),
        }),
      });

      if (workId) {
        await updateDoc(doc(db, 'worked', workId), { status: 'completed' });
      }

      Alert.alert('Success', 'Rating submitted successfully!', [
        { text: 'OK', onPress: () => router.push('/Home') },
      ]);
    } catch (error) {
      console.error('Error submitting rating:', error);
      Alert.alert('Error', 'Failed to submit rating.');
    } finally {
      setLoading(false);
    }
  };

  const renderStar = (starNumber: number) => (
    <TouchableOpacity
      key={starNumber}
      onPress={() => setRating(starNumber)}
      style={{ marginHorizontal: 4 }}
    >
      <Text style={[styles.star, rating >= starNumber ? styles.starSelected : styles.starUnselected]}>
        ★
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.centered, styles.background]}>
        <ActivityIndicator size="large" color="#3B7CF5" />
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
        <Text style={styles.headerTitle}>
          Rate <Text style={styles.highlightName}>{userName}</Text>
        </Text>
      </LinearGradient>

      <View style={styles.container}>
        <View style={styles.card}>
          <View style={styles.starRow}>{[1, 2, 3, 4, 5].map(renderStar)}</View>

          <TextInput
            style={styles.textInput}
            placeholder="Leave a comment (optional)"
            multiline
            numberOfLines={4}
            value={comment}
            onChangeText={setComment}
          />

          {/* Gradient Submit Button */}
          <TouchableOpacity style={{ borderRadius: 12, overflow: 'hidden' }} onPress={submitRating}>
            <LinearGradient
              colors={['#3B7CF5', '#5AD9D5']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.submitBtn}
            >
              <Text style={styles.submitBtnText}>Submit Rating</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: '#E6F2FF' },
  container: { flex: 1, justifyContent: 'center', padding: 20 },
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
  highlightName: { color: '#FFD700' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    elevation: 2,
  },
  starRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 24 },
  star: { fontSize: 40 },
  starSelected: { color: '#fbc02d' },
  starUnselected: { color: '#ddd' },
  textInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    marginBottom: 24,
    textAlignVertical: 'top',
    borderColor: '#3B7CF5',
    borderWidth: 1,
  },
  submitBtn: { paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  submitBtnText: { color: '#fff', fontSize: 18, fontWeight: '700' },
});




