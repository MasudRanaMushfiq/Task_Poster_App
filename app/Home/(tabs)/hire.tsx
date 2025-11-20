import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const hireOptions = [
  {
    id: '1',
    jobTitle: 'Cleaning Service',
    description: 'Professional cleaning for home or office. Reliable and affordable.',
    price: 1500,
  },
  {
    id: '2',
    jobTitle: 'Plumbing Repair',
    description: 'Fix leaks, blocked drains, and plumbing installations.',
    price: 2500,
  },
  {
    id: '3',
    jobTitle: 'Electrician Services',
    description: 'Electrical wiring, appliance installation, and troubleshooting.',
    price: 3000,
  },
  {
    id: '4',
    jobTitle: 'Painting Service',
    description: 'Interior and exterior painting by experienced professionals.',
    price: 5000,
  },
  {
    id: '5',
    jobTitle: 'Carpentry Work',
    description: 'Custom furniture, repairs, and installations.',
    price: 3500,
  },
  {
    id: '6',
    jobTitle: 'Gardening and Landscaping',
    description: 'Garden maintenance, planting, and landscaping services.',
    price: 2800,
  },
  {
    id: '7',
    jobTitle: 'Moving & Packing',
    description: 'Safe and quick moving service for your belongings.',
    price: 4000,
  },
  {
    id: '8',
    jobTitle: 'Cooking & Catering',
    description: 'Delicious homemade meals and catering for events.',
    price: 2200,
  },
  {
    id: '9',
    jobTitle: 'Babysitting',
    description: 'Experienced babysitters for your children’s care.',
    price: 1800,
  },
  {
    id: '10',
    jobTitle: 'Laundry Service',
    description: 'Quality washing and ironing services with quick turnaround.',
    price: 1200,
  },
];

export default function HireScreen() {
  const router = useRouter();

  const handleHireNow = (jobTitle: string) => {
    Alert.alert('Hire Request', `You have chosen to hire for "${jobTitle}".`);
  };

  return (
    <>
      {/* Gradient Header with StatusBar Fix */}
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

          <Text style={styles.headerTitle}>Book for Agency Services</Text>
        </View>
      </LinearGradient>

      {/* Main Content */}
      <ScrollView contentContainerStyle={styles.container}>
        {hireOptions.map(({ id, jobTitle, description, price }) => (
          <View key={id} style={styles.card}>
            <LinearGradient
              colors={['#3B7CF5', '#5AD9D5']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cardGradient}
            >
              <Text style={styles.jobTitle}>{jobTitle}</Text>
              <Text style={styles.description}>{description}</Text>
              <Text style={styles.price}>Price: ৳{price}</Text>

              <TouchableOpacity
                style={styles.hireButton}
                onPress={() => handleHireNow(jobTitle)}
              >
                <View style={styles.hireButtonWhite}>
                  <Text style={styles.hireButtonText}>Hire Now</Text>
                </View>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        ))}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    elevation: 4,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
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
    marginLeft: 60,
  },

  container: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: '#E6F2FF',
    minHeight: '100%',
  },
  card: {
    borderRadius: 20,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  cardGradient: {
    padding: 16,
    borderRadius: 20,
  },
  jobTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    color: '#f0f0f0',
    marginBottom: 12,
    lineHeight: 20,
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
    color: '#d3f0ffff',
    marginBottom: 16,
  },
  hireButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  hireButtonWhite: {
    backgroundColor: '#E6F2FF',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  hireButtonText: {
    color: '#3B7CF5',
    fontWeight: '700',
    fontSize: 16,
  },
});


