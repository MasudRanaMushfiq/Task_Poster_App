
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets, SafeAreaProvider } from 'react-native-safe-area-context';

export default function TabLayout() {
  return (
    <SafeAreaProvider>
      <InnerTabs />
    </SafeAreaProvider>
  );
}

function InnerTabs() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'index') iconName = 'home-outline';
          else if (route.name === 'hire') iconName = 'briefcase-outline';
          else if (route.name === 'works') iconName = 'list-outline';
          else if (route.name === 'profile') iconName = 'person-outline';
          else iconName = 'ellipse-outline';

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#3897f0',
        tabBarInactiveTintColor: '#888',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#eee',
          height: 60 + insets.bottom, 
          paddingBottom: 5 + insets.bottom,
          paddingTop: 5,
        },
        tabBarIconStyle: {
          marginTop: -4,
        },
        tabBarLabelStyle: {
          marginBottom: 2,
          fontSize: 12,
        },
        tabBarItemStyle: {
          paddingBottom: insets.bottom / 2,
        },
      })}
    />
  );
}
