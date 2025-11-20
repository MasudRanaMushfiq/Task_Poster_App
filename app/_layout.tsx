import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="Home/(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="admin/dashboard" options={{ headerShown: false }} />

      <Stack.Screen name="auth/login" options={{ headerShown: false }} />
      <Stack.Screen name="auth/signup" options={{ headerShown: false }} />

      <Stack.Screen name="category/[category]" options={{ headerShown: false }} />

      <Stack.Screen name="notification/accepted" options={{ headerShown: false }} />
      <Stack.Screen name="notification/acceptedsent" options={{ headerShown: false }} />
      <Stack.Screen name="notification/completed" options={{ headerShown: false }} />
      <Stack.Screen name="notification/completesent" options={{ headerShown: false }} />
      <Stack.Screen name="notification/general" options={{ headerShown: false }} />
      <Stack.Screen name="notification/notification" options={{ headerShown: false }} />

      <Stack.Screen name="profile/acceptedwork" options={{ headerShown: false }} />
      <Stack.Screen name="profile/completedwork" options={{ headerShown: false }} />
      <Stack.Screen name="profile/editprofile" options={{ headerShown: false }} />
      <Stack.Screen name="profile/history" options={{ headerShown: false }} />
      <Stack.Screen name="profile/pendingwork" options={{ headerShown: false }} />
      <Stack.Screen name="profile/postedwork" options={{ headerShown: false }} />
      <Stack.Screen name="profile/complain" options={{ headerShown: false }} />

      <Stack.Screen name="screen/activepost" options={{ headerShown: false }} />
      <Stack.Screen name="screen/allpost" options={{ headerShown: false }} />
      <Stack.Screen name="screen/completedpost" options={{ headerShown: false }} />
      <Stack.Screen name="screen/payment" options={{ headerShown: false }} />
      <Stack.Screen name="screen/pendingpost" options={{ headerShown: false }} />
      <Stack.Screen name="screen/post-your-work" options={{ headerShown: false }} />
      <Stack.Screen name="screen/rating" options={{ headerShown: false }} />
      <Stack.Screen name="screen/viewuser" options={{ headerShown: false }} />
      <Stack.Screen name="screen/wallet" options={{ headerShown: false }} />
      <Stack.Screen name="screen/showcomplain" options={{ headerShown: false }} />
      <Stack.Screen name="screen/complainfeedback" options={{ headerShown: false }} />

      <Stack.Screen name="works/[work]" options={{ headerShown: false }} />
      <Stack.Screen name="alluser" options={{ headerShown: false }} />

    </Stack>
  );
}



