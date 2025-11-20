import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  ScrollView,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { collection, doc, setDoc, Timestamp, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
import { db, auth } from '../../firebaseConfig';
import { useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { onAuthStateChanged } from 'firebase/auth';
import { LinearGradient } from 'expo-linear-gradient';

const categories = [
  'Cleaning', 'Plumbing', 'Electrician', 'Carpentry', 'Painting',
  'Gardening', 'Moving', 'Cooking', 'Babysitting', 'Laundry',
  'AC Repair', 'Pest Control', 'Beauty', 'Car Wash', 'Computer Repair',
  'Mobile Repair', 'Tutoring', 'Photography', 'Event Planning', 'Security', 'Other',
];

export default function PostWorkScreen() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userVerified, setUserVerified] = useState<boolean>(false);

  const [jobTitle, setJobTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        const userSnap = await getDoc(doc(db, 'users', user.uid));
        if (userSnap.exists()) {
          const userData = userSnap.data();
          setUserVerified(!!userData.verified);
        }
      } else {
        router.replace('/Home/(tabs)');
      }
    });
    return unsubscribe;
  }, []);

  const handlePostWork = async () => {
    if (!currentUser) {
      Alert.alert('Error', 'You must be logged in to post work.');
      return;
    }
    if (!userVerified) {
      Alert.alert('Verification Required', 'You need to be a verified user to post work.');
      return;
    }
    if (!jobTitle.trim() || !description.trim() || !price.trim() || !location.trim() || !category || !startDate || !endDate) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    setUploading(true);
    try {
      const normalizedStartDate = new Date(startDate);
      normalizedStartDate.setHours(0, 0, 0, 0);
      const normalizedEndDate = new Date(endDate);
      normalizedEndDate.setHours(0, 0, 0, 0);

      const workRef = doc(collection(db, 'worked'));
      const workData = {
        workId: workRef.id,
        userId: currentUser.uid,
        jobTitle: jobTitle.trim(),
        description: description.trim(),
        price: Number(price),
        location: location.trim(),
        category,
        startDate: Timestamp.fromDate(normalizedStartDate),
        endDate: Timestamp.fromDate(normalizedEndDate),
        createdAt: Timestamp.now(),
        status: 'active',
        images: [],
      };

      await setDoc(workRef, workData);
      await setDoc(doc(db, 'users', currentUser.uid, 'postedWorks', workRef.id), {
        workId: workRef.id,
        postedAt: Timestamp.now(),
        status: 'active',
      });
      await updateDoc(doc(db, 'users', currentUser.uid), {
        postedWorks: arrayUnion(workRef.id),
      });

      Alert.alert('Success', 'Work posted successfully!');
      router.replace('/Home/(tabs)');
    } catch (err) {
      console.error('Error posting work:', err);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'Select Date';
    return date.toLocaleDateString();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#E6F2FF' }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      {/* Gradient Header */}
      <LinearGradient
        colors={['#3B7CF5', '#5AD9D5']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: (Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 20) + 8 }]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Back</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.heading}>Post Your Work</Text>

        <TextInput
          placeholder="Work Title"
          placeholderTextColor="#544d4d"
          value={jobTitle}
          onChangeText={setJobTitle}
          style={styles.input}
        />

        <TextInput
          placeholder="Description"
          placeholderTextColor="#544d4d"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
        />

        <TextInput
          placeholder="Price Offered"
          placeholderTextColor="#544d4d"
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
          style={styles.input}
        />

        <TextInput
          placeholder="Location"
          placeholderTextColor="#544d4d"
          value={location}
          onChangeText={setLocation}
          style={styles.input}
        />

        {/* Start Date */}
        <TouchableOpacity style={styles.input} onPress={() => setShowStartDatePicker(true)}>
          <Text style={[styles.dateText, { color: startDate ? '#122f5dff' : '#544d4d' }]}>
            {startDate ? `Start: ${formatDate(startDate)}` : 'Select Start Date'}
          </Text>
        </TouchableOpacity>
        {showStartDatePicker && (
          <DateTimePicker
            value={startDate || new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, selectedDate) => {
              setShowStartDatePicker(false);
              if (selectedDate) setStartDate(selectedDate);
            }}
            minimumDate={new Date()}
          />
        )}

        {/* End Date */}
        <TouchableOpacity style={styles.input} onPress={() => setShowEndDatePicker(true)}>
          <Text style={[styles.dateText, { color: endDate ? '#122f5dff' : '#544d4d' }]}>
            {endDate ? `End: ${formatDate(endDate)}` : 'Select End Date'}
          </Text>
        </TouchableOpacity>
        {showEndDatePicker && (
          <DateTimePicker
            value={endDate || new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, selectedDate) => {
              setShowEndDatePicker(false);
              if (selectedDate) setEndDate(selectedDate);
            }}
            minimumDate={startDate || new Date()}
          />
        )}

        {/* Category Picker */}
        <View style={[styles.input, { paddingHorizontal: 0, justifyContent: 'center' }]}>
          <Picker
            selectedValue={category}
            onValueChange={(itemValue) => setCategory(itemValue)}
            style={{ color: category ? '#544d4d' : '#999', marginLeft: 8 }}
            dropdownIconColor="#3B7CF5"
          >
            <Picker.Item label="Select Category" value="" color="#999" />
            {categories.map((cat) => (
              <Picker.Item label={cat} value={cat} key={cat} />
            ))}
          </Picker>
        </View>

        {/* Submit Button */}
        <TouchableOpacity style={styles.button} onPress={handlePostWork} disabled={uploading}>
          <LinearGradient
            colors={['#3B7CF5', '#5AD9D5']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.buttonGradient}
          >
            <Text style={styles.buttonText}>{uploading ? 'Posting...' : 'Post Work'}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingVertical: 18,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    elevation: 4,
  },
  backBtn: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginLeft: 10,
  },
  scrollContainer: {
    paddingVertical: 20,
    backgroundColor: '#E6F2FF',
    minHeight: '100%',
  },
  heading: {
    fontSize: 22,
    fontWeight: '600',
    color: '#3B7CF5',
    marginVertical: 10,
    marginLeft: 30,
  },
  input: {
    height: 48,
    borderColor: '#3B7CF5',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    marginBottom: 12,
    marginHorizontal: 30,
    backgroundColor: '#fff',
    color: '#544d4d',
    justifyContent: 'center',
  },
  dateText: {
    color: '#544d4d',
  },
  button: {
    marginTop: 10,
    marginHorizontal: 30,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
  },
  buttonGradient: {
    paddingVertical: 14,
    borderRadius: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
});



