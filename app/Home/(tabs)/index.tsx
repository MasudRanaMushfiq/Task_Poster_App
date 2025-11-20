import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  Alert,
  Dimensions,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
  Platform,
} from 'react-native';
import { getAuth } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';
import { LinearGradient } from 'expo-linear-gradient';

const categories = [
  { name: 'Cleaning', icon: 'broom' },
  { name: 'Plumbing', icon: 'pipe-wrench' },
  { name: 'Electrician', icon: 'flash' },
  { name: 'Painting', icon: 'format-paint' },
  { name: 'Carpentry', icon: 'hammer' },
  { name: 'Gardening', icon: 'flower' },
  { name: 'Moving', icon: 'truck-fast' },
  { name: 'Cooking', icon: 'chef-hat' },
  { name: 'Babysitting', icon: 'baby-face-outline' },
  { name: 'Laundry', icon: 'washing-machine' },
  { name: 'AC Repair', icon: 'air-conditioner' },
  { name: 'Pest Control', icon: 'bug' },
  { name: 'Beauty', icon: 'face-woman' },
  { name: 'Car Wash', icon: 'car-wash' },
  { name: 'Computer Repair', icon: 'laptop' },
  { name: 'Mobile Repair', icon: 'cellphone-cog' },
  { name: 'Tutoring', icon: 'book-open-variant' },
  { name: 'Photography', icon: 'camera' },
  { name: 'Event Planning', icon: 'calendar-star' },
  { name: 'Security', icon: 'shield-account' },
  { name: 'Other', icon: 'dots-horizontal' },
];

const { width } = Dimensions.get('window');
const numColumns = 3;
const horizontalMargin = 6;
const cardWidth =
  (width - 2 * 16 - numColumns * 2 * horizontalMargin) / numColumns;

export default function HomeScreen() {
  const router = useRouter();
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    const user = getAuth().currentUser;
    if (!user) return;

    const q = query(
      collection(db, 'notifications'),
      where('toUserId', '==', user.uid),
      where('read', '==', false)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setHasUnread(!snapshot.empty);
    });

    return () => unsubscribe();
  }, []);

  const handleCategoryPress = (category: { name: string; icon: string }) => {
    const categoryName = category.name.toLowerCase().replace(/\s+/g, '-');
    router.push({
      pathname: '/category/[category]',
      params: { category: categoryName },
    });
  };

  const handleNotificationPress = async () => {
    try {
      const user = getAuth().currentUser;
      if (!user) {
        Alert.alert('Not logged in', 'Please log in to view notifications.');
        return;
      }
      router.push('/notification/notification');
    } catch (error) {
      console.error('Error loading notifications:', error);
      Alert.alert('Error', 'Failed to load notifications.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Fixed Gradient Header with Correct StatusBar Handling */}
      <LinearGradient
        colors={['#3B7CF5', '#5AD9D5']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[
          styles.header,
          {
            paddingTop:
              Platform.OS === 'android'
                ? (StatusBar.currentHeight || 0) * 0.5 + 15
                : 10,
          },
        ]}
      >
        <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

        <View style={styles.headingRow}>
          <View style={styles.headingWrap}>
            <Text style={styles.heading}>Lok Lagbe?</Text>
            <Text style={styles.tagline}>
              Find trusted professionals for any service
            </Text>
          </View>

          <TouchableOpacity
            style={styles.notificationBtn}
            activeOpacity={0.7}
            onPress={handleNotificationPress}
          >
            <View style={{ position: 'relative' }}>
              <MaterialCommunityIcons
                name="bell-outline"
                size={28}
                color="#015affff"
              />
              {hasUnread && <View style={styles.redDot} />}
            </View>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Main Category Section */}
      <View style={styles.container}>
        <Text style={styles.categoriesHeading}>Categories</Text>

        <FlatList
          data={categories}
          keyExtractor={(item) => item.name}
          numColumns={numColumns}
          contentContainerStyle={styles.categoryGrid}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.categoryTouch}
              activeOpacity={0.85}
              onPress={() => handleCategoryPress(item)}
            >
              <LinearGradient
                colors={['#3B7CF5', '#5AD9D5']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cardBorder}
              >
                <View style={styles.categoryCard}>
                  <MaterialCommunityIcons
                    name={item.icon as keyof typeof MaterialCommunityIcons.glyphMap}
                    size={26}
                    color="#3B7CF5"
                    style={{ marginBottom: 6 }}
                  />
                  <Text style={styles.categoryText}>{item.name}</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          )}
          showsVerticalScrollIndicator={false}
        />

        {/* Post Button */}
        <View style={styles.postBtnWrap}>
          <LinearGradient
            colors={['#3B7CF5', '#5AD9D5']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.postBtn}
          >
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => router.push('/screen/post-your-work')}
            >
              <Text style={styles.postBtnText}>Post your work</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#E6F2FF' },
  header: {
    paddingHorizontal: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 6,
  },
  headingRow: {
    flexDirection: 'row',
    alignItems: 'center', 
    justifyContent: 'space-between',
    paddingVertical: 22,
  },
  headingWrap: { flex: 1, paddingRight: 8 },
  heading: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
    textAlign: 'left',
    lineHeight: 36,
  },
  tagline: { fontSize: 15, color: '#ffffffff', marginTop: 2 },
  notificationBtn: {
    marginLeft: 8,
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(250, 250, 250, 0.36)',
  },
  redDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'red',
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 14,
    backgroundColor: '#E6F2FF',
  },
  categoriesHeading: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 10,
    color: '#3B7CF5',
    letterSpacing: 0.5,
    marginLeft: 4,
  },
  categoryGrid: { paddingBottom: 90 },
  categoryTouch: {
    width: cardWidth,
    marginHorizontal: horizontalMargin,
    marginVertical: 8,
  },
  cardBorder: { borderRadius: 16, padding: 2 },
  categoryCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  categoryText: {
    fontSize: 13,
    color: '#3B7CF5',
    fontWeight: '600',
    textAlign: 'center',
  },
  postBtnWrap: { alignItems: 'center', marginTop: 12, marginBottom: 15 },
  postBtn: {
    paddingVertical: 12,
    paddingHorizontal: 48,
    borderRadius: 30,
    alignItems: 'center',
    elevation: 4,
  },
  postBtnText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});



