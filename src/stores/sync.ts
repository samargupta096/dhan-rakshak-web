import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useAuthStore } from './auth';
import { usePortfolioStore } from './portfolio';
import { useTransactionsStore } from './transactions';
import { useGoalsStore } from './goals';
import { useTripsStore } from './trips';
import { useRemindersStore } from './reminders';
import { useSettingsStore } from './settings';
import { syncAllToCloud, fetchAllFromCloud } from '@/services/auth/cloudSync';
import { db } from '@/services/db/indexedDb';

export const useSyncStore = defineStore('sync', () => {
    const syncing = ref(false);
    const lastSyncTime = ref<number | null>(null);
    const error = ref<string | null>(null);
    const autoSync = ref(true);

    /**
     * Upload all local data to cloud
     */
    async function uploadToCloud() {
        const authStore = useAuthStore();

        if (!authStore.isAuthenticated) {
            error.value = 'Must be logged in to sync';
            return;
        }

        syncing.value = true;
        error.value = null;

        try {
            const portfolioStore = usePortfolioStore();
            const transactionsStore = useTransactionsStore();
            const goalsStore = useGoalsStore();
            const tripsStore = useTripsStore();
            const remindersStore = useRemindersStore();
            const settingsStore = useSettingsStore();

            await syncAllToCloud({
                assets: portfolioStore.assets,
                transactions: transactionsStore.transactions,
                goals: goalsStore.goals,
                trips: tripsStore.trips,
                reminders: remindersStore.reminders,
                settings: settingsStore.settings
            });

            lastSyncTime.value = Date.now();
            localStorage.setItem('lastSyncTime', lastSyncTime.value.toString());
        } catch (e: any) {
            error.value = e.message || 'Failed to sync to cloud';
            throw e;
        } finally {
            syncing.value = false;
        }
    }

    /**
     * Download all cloud data to local
     */
    async function downloadFromCloud() {
        const authStore = useAuthStore();

        if (!authStore.isAuthenticated) {
            error.value = 'Must be logged in to download';
            return;
        }

        syncing.value = true;
        error.value = null;

        try {
            const cloudData = await fetchAllFromCloud();

            // Clear local DB
            await db.assets.clear();
            await db.transactions.clear();
            await db.goals.clear();
            await db.trips.clear();
            await db.reminders.clear();

            // Import cloud data
            if (cloudData.assets.length) await db.assets.bulkAdd(cloudData.assets);
            if (cloudData.transactions.length) await db.transactions.bulkAdd(cloudData.transactions);
            if (cloudData.goals.length) await db.goals.bulkAdd(cloudData.goals);
            if (cloudData.trips.length) await db.trips.bulkAdd(cloudData.trips);
            if (cloudData.reminders.length) await db.reminders.bulkAdd(cloudData.reminders);

            // Reload all stores
            const portfolioStore = usePortfolioStore();
            const transactionsStore = useTransactionsStore();
            const goalsStore = useGoalsStore();
            const tripsStore = useTripsStore();
            const remindersStore = useRemindersStore();

            await Promise.all([
                portfolioStore.loadAssets(),
                transactionsStore.loadTransactions(),
                goalsStore.loadGoals(),
                tripsStore.loadTrips(),
                remindersStore.loadReminders()
            ]);

            lastSyncTime.value = Date.now();
            localStorage.setItem('lastSyncTime', lastSyncTime.value.toString());
        } catch (e: any) {
            error.value = e.message || 'Failed to download from cloud';
            throw e;
        } finally {
            syncing.value = false;
        }
    }

    /**
     * Initialize sync (called after login)
     */
    function initSync() {
        const savedSyncTime = localStorage.getItem('lastSyncTime');
        if (savedSyncTime) {
            lastSyncTime.value = parseInt(savedSyncTime);
        }
    }

    return {
        syncing,
        lastSyncTime,
        error,
        autoSync,
        uploadToCloud,
        downloadFromCloud,
        initSync
    };
});
