// Firebase Configuration and Authentication
import { initializeApp } from 'firebase/app';
import {
    getAuth,
    signInWithPopup,
    signOut,
    GoogleAuthProvider,
    OAuthProvider,
    onAuthStateChanged,
    type User
} from 'firebase/auth';

// Firebase configuration
// NOTE: Replace these with your own Firebase project credentials
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// OAuth Providers
const googleProvider = new GoogleAuthProvider();
const microsoftProvider = new OAuthProvider('microsoft.com');

/**
 * Sign in with Google
 */
export async function signInWithGoogle(): Promise<User | null> {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        return result.user;
    } catch (error) {
        console.error('Google sign-in error:', error);
        throw error;
    }
}

/**
 * Sign in with Microsoft
 */
export async function signInWithMicrosoft(): Promise<User | null> {
    try {
        const result = await signInWithPopup(auth, microsoftProvider);
        return result.user;
    } catch (error) {
        console.error('Microsoft sign-in error:', error);
        throw error;
    }
}

/**
 * Sign out
 */
export async function signOutUser(): Promise<void> {
    try {
        await signOut(auth);
    } catch (error) {
        console.error('Sign-out error:', error);
        throw error;
    }
}

/**
 * Listen to auth state changes
 */
export function onAuthChange(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
}

/**
 * Get current user
 */
export function getCurrentUser(): User | null {
    return auth.currentUser;
}
