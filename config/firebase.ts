import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApp, getApps, initializeApp } from "firebase/app";
import {
    getAuth,
    getReactNativePersistence,
    initializeAuth,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey:
    process.env.EXPO_PUBLIC_FIREBASE_API_KEY ||
    "AIzaSyBjlp1GiSpQt93D4laJktMqe8L-jXLU4-I",
  authDomain:
    process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    "advisewise-he4ft.firebaseapp.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "advisewise-he4ft",
  storageBucket:
    process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    "advisewise-he4ft.firebasestorage.app",
  messagingSenderId:
    process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "1099003436313",
  appId:
    process.env.EXPO_PUBLIC_FIREBASE_APP_ID ||
    "1:1099003436313:android:39e98c9cc604d676c23988",
};

// Initialize Firebase (only once)
let app;
let auth;

if (getApps().length === 0) {
  // First initialization
  app = initializeApp(firebaseConfig);
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
  console.log("Firebase initialized with AsyncStorage persistence");
} else {
  // Already initialized (hot reload)
  app = getApp();
  auth = getAuth(app);
  console.log("Firebase already initialized, reusing existing instance");
}

// Initialize Firestore
const db = getFirestore(app);

export { auth, db };
export default app;
