import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import {
    signInWithGoogle,
    signInWithMicrosoft,
    signOutUser,
    onAuthChange,
    getCurrentUser
} from '@/services/auth/firebase';
import type { User } from 'firebase/auth';

export const useAuthStore = defineStore('auth', () => {
    const user = ref<User | null>(null);
    const loading = ref(false);
    const error = ref<string | null>(null);
    const initialized = ref(false);

    const isAuthenticated = computed(() => !!user.value);
    const displayName = computed(() => user.value?.displayName || user.value?.email || 'User');
    const email = computed(() => user.value?.email || '');
    const photoURL = computed(() => user.value?.photoURL || '');

    // Initialize auth listener
    function initAuth() {
        if (initialized.value) return;

        onAuthChange((firebaseUser) => {
            user.value = firebaseUser;
            initialized.value = true;
        });
    }

    // Sign in with Google
    async function loginWithGoogle() {
        loading.value = true;
        error.value = null;

        try {
            const firebaseUser = await signInWithGoogle();
            user.value = firebaseUser;
        } catch (e: any) {
            error.value = e.message || 'Failed to sign in with Google';
            throw e;
        } finally {
            loading.value = false;
        }
    }

    // Sign in with Microsoft
    async function loginWithMicrosoft() {
        loading.value = true;
        error.value = null;

        try {
            const firebaseUser = await signInWithMicrosoft();
            user.value = firebaseUser;
        } catch (e: any) {
            error.value = e.message || 'Failed to sign in with Microsoft';
            throw e;
        } finally {
            loading.value = false;
        }
    }

    // Sign out
    async function logout() {
        loading.value = true;
        error.value = null;

        try {
            await signOutUser();
            user.value = null;
        } catch (e: any) {
            error.value = e.message || 'Failed to sign out';
            throw e;
        } finally {
            loading.value = false;
        }
    }

    return {
        user,
        loading,
        error,
        isAuthenticated,
        displayName,
        email,
        photoURL,
        initAuth,
        loginWithGoogle,
        loginWithMicrosoft,
        logout
    };
});
