import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';
import { db } from '../../firebaseConfig';
import { LinearGradient } from 'expo-linear-gradient';

export const unstable_settings = {
  headerShown: false,
};

type Work = {
  id: string;
  jobTitle: string;
  price: number | string;
  description: string;
  location: string;
  endDate: any;
};

export default function CategoryScreen() {
  const router = useRouter();
  const { category } = useLocalSearchParams();

  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryName, setCategoryName] = useState('');

  const categoryMap: Record<string, string> = {
    cleaning: 'Cleaning',
    plumbing: 'Plumbing',
    electrician: 'Electrician',
    painting: 'Painting',
    carpentry: 'Carpentry',
    gardening: 'Gardening',
    moving: 'Moving',
    cooking: 'Cooking',
    babysitting: 'Babysitting',
    laundry: 'Laundry',
    'ac-repair': 'AC Repair',
    'pest-control': 'Pest Control',
    beauty: 'Beauty',
    'car-wash': 'Car Wash',
    'computer-repair': 'Computer Repair',
    'mobile-repair': 'Mobile Repair',
    tutoring: 'Tutoring',
    photography: 'Photography',
    'event-planning': 'Event Planning',
    security: 'Security',
    other: 'Other',
  };

  useEffect(() => {
    if (!category) return;

    const fetchWorks = async () => {
      setLoading(true);
      try {
        const normalizedSlug = (category as string).toLowerCase();
        const firestoreCategory = categoryMap[normalizedSlug];

        if (!firestoreCategory) {
          Alert.alert('Invalid category', 'This category does not exist.');
          setWorks([]);
          setCategoryName('');
          setLoading(false);
          return;
        }

        setCategoryName(firestoreCategory);
        const worksRef = collection(db, 'worked');
        const q = query(worksRef, where('category', '==', firestoreCategory));
        const querySnapshot = await getDocs(q);

        const list: Work[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          list.push({
            id: doc.id,
            jobTitle: data.jobTitle || 'Untitled Work',
            price: data.price ?? 'N/A',
            description: data.description || '',
            location: data.location || 'N/A',
            endDate: data.endDate || null,
          });
        });

        setWorks(list);
      } catch (error) {
        console.error('Error fetching category works:', error);
        Alert.alert('Error', 'Failed to load works for this category.');
      } finally {
        setLoading(false);
      }
    };

    fetchWorks();
  }, [category]);

  const formatEndDate = (date: any) => {
    if (!date) return 'N/A';
    let jsDate;
    if (date.toDate) jsDate = date.toDate();
    else jsDate = new Date(date);
    return jsDate.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const renderItem = ({ item }: { item: Work }) => (
    <LinearGradient
      colors={['#3B7CF5', '#5AD9D5']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.cardBorder}
    >
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push(`/works/${item.id}`)}
        activeOpacity={0.9}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.title}>{item.jobTitle}</Text>

          {/* Gradient mini price card */}
          <LinearGradient
            colors={['#3B7CF5', '#5AD9D5']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.priceTag}
          >
            <Ionicons name="cash-outline" size={16} color="#fff" />
            <Text style={styles.priceText}>৳{item.price}</Text>
          </LinearGradient>
        </View>

        <Text style={styles.description}>{item.description}</Text>

        <View style={styles.dashedLine} />

        <View style={styles.cardFooter}>
          {/* Gradient mini location card */}
          <LinearGradient
            colors={['#4A8FF0', '#65D4C9']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.footerMiniCard}
          >
            <Ionicons name="location-sharp" size={16} color="#fff" />
            <Text style={styles.footerText}>{item.location}</Text>
          </LinearGradient>

          {/* Gradient mini date card */}
          <LinearGradient
            colors={['#4A8FF0', '#65D4C9']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.footerMiniCard}
          >
            <Ionicons name="calendar-outline" size={16} color="#fff" />
            <Text style={styles.footerText}>{formatEndDate(item.endDate)}</Text>
          </LinearGradient>
        </View>
      </TouchableOpacity>
    </LinearGradient>
  );

  return (
    <>
      {/* Balanced Gradient Header */}
      <LinearGradient
        colors={['#3B7CF5', '#5AD9D5']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.header,
          {
            paddingTop:
              Platform.OS === 'android'
                ? (StatusBar.currentHeight || 0) * 0.5 + 10
                : 10,
          },
        ]}
      >
        <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{categoryName || 'Category'}</Text>
        </View>
      </LinearGradient>

      <SafeAreaView style={styles.container}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3B7CF5" />
            <Text style={styles.loadingText}>Loading works...</Text>
          </View>
        ) : works.length === 0 ? (
          <View style={styles.loadingContainer}>
            <Ionicons name="alert-circle-outline" size={36} color="#3B7CF5" />
            <Text style={styles.loadingText}>
              No works found in this category.
            </Text>
          </View>
        ) : (
          <FlatList
            data={works}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
        )}
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    elevation: 4,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  backBtn: {
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginLeft: 10,
  },

  container: {
    flex: 1,
    backgroundColor: '#E6F2FF',
  },
  list: {
    padding: 16,
  },

  cardBorder: {
    borderRadius: 22,
    padding: 2,
    marginBottom: 18,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    color: '#333',
    fontSize: 18,
    fontWeight: '900',
    flex: 1,
    marginRight: 10,
  },
  priceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  priceText: {
    color: '#fff',
    marginLeft: 5,
    fontWeight: '700',
  },

  description: {
    fontSize: 14,
    color: '#444',
    marginBottom: 10,
  },

  dashedLine: {
    borderBottomWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(0,0,0,0.1)',
    marginVertical: 10,
  },

  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerMiniCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  footerText: {
    color: '#fff',
    fontSize: 13,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    color: '#3B7CF5',
    fontSize: 16,
    fontWeight: '500',
  },
});




