import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
// @ts-ignore - getReactNativePersistence is available in the React Native build of Firebase but not in the standard types
import { initializeAuth, getReactNativePersistence, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

declare global {
    // eslint-disable-next-line no-var
    var __firebaseApp: FirebaseApp | undefined;
    // eslint-disable-next-line no-var
    var __firebaseAuth: Auth | undefined;
}

if (!process.env.EXPO_PUBLIC_FIREBASE_API_KEY) {
    console.error('❌ Firebase API Key is missing! Check your .env file and ensure EXPO_PUBLIC_FIREBASE_API_KEY is set.');
}

if (!process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN) {
    console.error('❌ Firebase Auth Domain is missing! Check your .env file and ensure EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN is set.');
}

if (!process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID) {
    console.error('❌ Firebase Project ID is missing! Check your .env file and ensure EXPO_PUBLIC_FIREBASE_PROJECT_ID is set.');
}

if (!process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET) {
    console.error('❌ Firebase Storage Bucket is missing! Check your .env file and ensure EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET is set.');
}

if (!process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID) {
    console.error('❌ Firebase Messaging Sender ID is missing! Check your .env file and ensure EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID is set.');
}

if (!process.env.EXPO_PUBLIC_FIREBASE_APP_ID) {
    console.error('❌ Firebase App ID is missing! Check your .env file and ensure EXPO_PUBLIC_FIREBASE_APP_ID is set.');
}

const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? '',
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? '',
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? '',
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? '',
};

if (!global.__firebaseApp) {
    global.__firebaseApp = getApps().length === 0
        ? initializeApp(firebaseConfig)
        : getApp();
}

if (!global.__firebaseAuth) {
    global.__firebaseAuth = initializeAuth(global.__firebaseApp, {
        persistence: getReactNativePersistence(AsyncStorage),
    });
}

export const auth: Auth = global.__firebaseAuth;
export const db: Firestore = getFirestore(global.__firebaseApp);
