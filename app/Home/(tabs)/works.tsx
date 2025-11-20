import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { useEffect, useState, useCallback } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
  StatusBar,
  SafeAreaView,
  Platform,
} from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import { db } from '../../../firebaseConfig';
import { LinearGradient } from 'expo-linear-gradient';

const categories = [
  'Cleaning', 'Plumbing', 'Electrician', 'Painting', 'Carpentry', 'Gardening',
  'Moving', 'Cooking', 'Babysitting', 'Laundry', 'AC Repair', 'Pest Control',
  'Beauty', 'Car Wash', 'Computer Repair', 'Mobile Repair', 'Tutoring',
  'Photography', 'Event Planning', 'Security', 'Other',
];

export default function WorksScreen() {
  const [works, setWorks] = useState<any[]>([]);
  const [filteredWorks, setFilteredWorks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [userNames, setUserNames] = useState<Record<string, string>>({});
  const router = useRouter();

  const fetchWorks = useCallback(async () => {
    try {
      if (!refreshing) setLoading(true);

      const querySnapshot = await getDocs(collection(db, 'worked'));
      let worksList: any[] = [];
      const userIdSet = new Set<string>();

      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.status === 'active') {
          worksList.push({ id: docSnap.id, ...data });
          if (data.userId) userIdSet.add(data.userId);
        }
      });

      // Sort by latest posted (descending)
      worksList.sort((a, b) => {
        const aTime = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
        const bTime = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
        return bTime - aTime;
      });

      const userDocs = await Promise.all(
        Array.from(userIdSet).map(async (uid) => {
          const userDoc = await getDoc(doc(db, 'users', uid));
          return userDoc.exists() ? { uid, fullName: userDoc.data().fullName } : null;
        })
      );

      const namesMap: Record<string, string> = {};
      userDocs.forEach((u) => { if (u) namesMap[u.uid] = u.fullName; });

      setUserNames(namesMap);
      setWorks(worksList);
      setFilteredWorks(worksList);
    } catch (error) {
      console.error('Error fetching works:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [refreshing]);

  useEffect(() => { fetchWorks(); }, [fetchWorks]);

  useEffect(() => {
    let filtered = [...works];
    if (selectedCategory) filtered = filtered.filter(w => w.category === selectedCategory);
    if (selectedLocation) filtered = filtered.filter(
      w => w.location?.toLowerCase() === selectedLocation.toLowerCase()
    );
    setFilteredWorks(filtered);
  }, [selectedCategory, selectedLocation, works]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchWorks();
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3B7CF5" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#E6F2FF' }}>
      {/* Header */}
      <LinearGradient
        colors={['#3B7CF5', '#5AD9D5']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.header,
          {
            paddingTop:
              (Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0) + 10,
          },
        ]}
      >
        <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

        <Text style={styles.headerTitle}>Available Works</Text>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#3B7CF5']} />
        }
      >
        {/* Filters */}
        <View style={styles.filtersRow}>
          <View style={styles.filterContainer}>
            <Ionicons name="filter" size={20} color="#3B7CF5" style={styles.filterIcon} />
            <View style={styles.pickerWrapper}>
              <RNPickerSelect
                onValueChange={setSelectedCategory}
                placeholder={{ label: 'Select category', value: '' }}
                items={categories.map((cat) => ({ label: cat, value: cat }))}
                style={pickerSelectStyles}
                value={selectedCategory}
                useNativeAndroidPickerStyle={false}
              />
            </View>
          </View>

          <View style={styles.filterContainer}>
            <Ionicons name="location" size={20} color="#3B7CF5" style={styles.filterIcon} />
            <View style={styles.pickerWrapper}>
              <RNPickerSelect
                onValueChange={setSelectedLocation}
                placeholder={{ label: 'Select location', value: '' }}
                items={[...new Set(works.map(w => w.location))].map(loc => ({ label: loc, value: loc }))}
                style={pickerSelectStyles}
                value={selectedLocation}
                useNativeAndroidPickerStyle={false}
              />
            </View>
          </View>
        </View>

        {filteredWorks.length === 0 ? (
          <Text style={styles.noWorksText}>No works found for selected filters</Text>
        ) : (
          filteredWorks.map((work) => (
            <TouchableOpacity
              key={work.id}
              style={styles.workCard}
              onPress={() => router.push({ pathname: '/works/[work]', params: { work: work.id } })}
            >
              <LinearGradient
                colors={['#3B7CF5', '#5AD9D5']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cardBorder}
              >
                <View style={styles.cardWhite}>
                  <Text style={styles.workTitle}>{work.jobTitle}</Text>
                  <Text style={styles.workDescription}>{work.description}</Text>

                  <View style={styles.categoryRow}>
                    <Text style={styles.categoryLabel}>Category:</Text>
                    <Text style={styles.categoryValue}>{work.category}</Text>
                  </View>

                  <View style={styles.divider} />
                  <View style={styles.subCardRow}>
                    <LinearGradient
                      colors={['#d0e8ff', '#a0d4ff']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.subCard}
                    >
                      <Text style={styles.subCardSmallLabel}>Price</Text>
                      <View style={styles.subCardContent}>
                        <Ionicons name="pricetag" size={18} color="#3B7CF5" style={styles.subCardIcon}/>
                        <Text style={styles.subCardValue}>৳{work.price}</Text>
                      </View>
                    </LinearGradient>

                    <LinearGradient
                      colors={['#d0e8ff', '#a0d4ff']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.subCard}
                    >
                      <Text style={styles.subCardSmallLabel}>Location</Text>
                      <View style={styles.subCardContent}>
                        <Ionicons name="location-sharp" size={18} color="#3B7CF5" style={styles.subCardIcon}/>
                        <Text style={styles.subCardValue}>{work.location}</Text>
                      </View>
                    </LinearGradient>
                  </View>

                  <Text style={styles.postedBy}>
                    Posted by: <Text style={styles.postedByHighlight}>{userNames[work.userId] || 'Loading...'}</Text>
                  </Text>

                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 14,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    elevation: 4,
  },
  backBtn: { position: 'absolute', left: 16, justifyContent: 'center', alignItems: 'center', top: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 4 : 10 },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: '700' },
  container: { padding: 16, backgroundColor: '#E6F2FF', minHeight: '100%' },
  filtersRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, marginBottom: 20 },
  filterContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, padding: 8, elevation: 2 },
  filterIcon: { marginRight: 6 },
  pickerWrapper: { flex: 1 },
  noWorksText: { fontSize: 16, color: '#544d4d', textAlign: 'center', marginTop: 20 },
  workCard: { borderRadius: 20, marginBottom: 16, overflow: 'hidden', elevation: 3 },
  cardBorder: { padding: 2, borderRadius: 20 },
  cardWhite: { backgroundColor: '#fff', borderRadius: 18, padding: 16 },
  workTitle: { fontSize: 20, fontWeight: '700', color: '#fc7c03ff', marginBottom: 12 },
  workDescription: { fontSize: 16, color: '#544d4d', marginBottom: 8 },
  categoryRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  categoryLabel: { fontSize: 15, fontWeight: '600', color: '#3B7CF5', marginRight: 6 },
  categoryValue: { fontSize: 15, fontStyle: 'italic', color: '#544d4d' },
  divider: { height: 1, backgroundColor: '#00000010', marginVertical: 6 },
  subCardRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  subCard: { width: '48%', borderRadius: 10, padding: 10 },
  subCardSmallLabel: { fontSize: 13, color: '#3B7CF5', marginBottom: 2 },
  subCardContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' },
  subCardIcon: { marginRight: 6 },
  subCardValue: { fontSize: 16, fontWeight: '600', color: '#3B7CF5', marginLeft: 6, maxWidth: '75%' },
  postedBy: { fontSize: 16, fontWeight: '500', color: '#3B7CF5', marginBottom: 12 },
  postedByHighlight: { fontWeight: '700', color: '#029200ff' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: { fontSize: 14, color: '#3B7CF5', paddingVertical: 6, flex: 1 },
  inputAndroid: { fontSize: 14, color: '#3B7CF5', paddingVertical: 6, flex: 1 },
  placeholder: { color: '#888' },
});



