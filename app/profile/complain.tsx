import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  StatusBar,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { db } from '../../firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const ComplainScreen = () => {
  const [complainUser, setComplainUser] = useState('');
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [sending, setSending] = useState(false);

  const router = useRouter();
  const auth = getAuth();
  const currentUser = auth.currentUser;

  const handleSend = async () => {
    if (!complainUser || !title || !details) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    setSending(true);

    try {
      await addDoc(collection(db, 'complains'), {
        fromUserId: currentUser?.uid || null,
        title,
        details,
        status: 'pending', 
        createdAt: serverTimestamp(),
      });

      Alert.alert('Success', 'Your complaint has been submitted!');
      setComplainUser('');
      setTitle('');
      setDetails('');
    } catch (error: any) {
      console.error('Error submitting complain:', error);
      Alert.alert('Error', 'Failed to submit complaint');
    } finally {
      setSending(false);
    }
    
      router.push('/Home/profile');
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#E6F2FF' }}>
      <StatusBar backgroundColor="#4A8FF0" barStyle="light-content" />

      {/* Header */}
      <LinearGradient
        colors={['#4A8FF0', '#65D4C9']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[
          styles.header,
          { paddingTop: (Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 20) + 8 },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Complain</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.container}>
        <LinearGradient
          colors={['#3B7CF5', '#5AD9D5']}
          style={styles.formCardGradient}
        >
          <View style={styles.formCard}>
            <Text style={styles.label}>User</Text>
            <TextInput
              style={styles.input}
              value={complainUser}
              onChangeText={setComplainUser}
              placeholder="Username"
              placeholderTextColor="#999"
            />

            <Text style={styles.label}>Problem Type</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Enter problem type or title"
              placeholderTextColor="#999"
            />

            <Text style={styles.label}>Details</Text>
            <TextInput
              style={[styles.input, { height: 120 }]}
              value={details}
              onChangeText={setDetails}
              placeholder="Describe the issue..."
              multiline
              placeholderTextColor="#999"
            />

            <LinearGradient
              colors={['#3B7CF5', '#5AD9D5']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.sendButton}
            >
              <TouchableOpacity
                onPress={handleSend}
                style={{ width: '100%', alignItems: 'center' }}
                disabled={sending}
              >
                <Text style={styles.sendButtonText}>
                  {sending ? 'Submitting...' : 'Submit Complaint'}
                </Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </LinearGradient>
      </ScrollView>
    </View>
  );
};

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
  },
  backBtn: { padding: 4 },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '700', marginLeft: 12 },

  container: { padding: 16, alignItems: 'center' },

  formCardGradient: { borderRadius: 20, width: '95%', padding: 2, marginTop: 30 },
  formCard: { backgroundColor: '#fff', borderRadius: 18, padding: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#3a125d', marginTop: 12 },
  input: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#333',
    fontSize: 14,
  },

  sendButton: { borderRadius: 24, marginTop: 20, paddingVertical: 12 },
  sendButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});

export default ComplainScreen;





