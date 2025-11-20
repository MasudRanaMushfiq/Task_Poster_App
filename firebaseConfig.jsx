// Import required Firebase modules
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDGwnEn-_hKiLDQIlddTTvI2Qe9OFq7Y4U",
  authDomain: "lok-lagbe-f77de.firebaseapp.com",
  projectId: "lok-lagbe-f77de",
  storageBucket: "lok-lagbe-f77de.firebasestorage.app",
  messagingSenderId: "774490137442",
  appId: "1:774490137442:web:601ac1b7163e497718823b",
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// ✅ Initialize Auth with persistent login (auto-login)
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// Initialize Firestore and Storage
const db = getFirestore(app);
const storage = getStorage(app);

// Export all Firebase services
export { app, auth, db, storage };


