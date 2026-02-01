import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import { db, initializeSettings } from '@/services/db/indexedDb';
import type { UserSettings } from '@/types';

export const useSettingsStore = defineStore('settings', () => {
    const settings = ref<UserSettings>({
        darkMode: true,
        currency: 'INR',
        language: 'en',
        notifications: true,
        biometricLock: false,
        monthlyBudget: 50000,
        savingsGoalPercentage: 30
    });
    const loading = ref(false);
    const initialized = ref(false);

    // Watch for dark mode changes and apply to document
    watch(() => settings.value.darkMode, (isDark) => {
        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, { immediate: true });

    // Actions
    async function loadSettings() {
        loading.value = true;
        try {
            const loadedSettings = await initializeSettings();
            settings.value = loadedSettings;
            initialized.value = true;
        } catch (e) {
            console.error('Failed to load settings:', e);
        } finally {
            loading.value = false;
        }
    }

    async function updateSettings(updates: Partial<UserSettings>) {
        try {
            const allSettings = await db.settings.toArray();
            if (allSettings.length > 0 && allSettings[0]?.id) {
                await db.settings.update(allSettings[0].id, updates);
                settings.value = { ...settings.value, ...updates };
            }
        } catch (e) {
            console.error('Failed to update settings:', e);
            throw e;
        }
    }

    // Helper to save current settings to DB
    async function saveSettings() {
        await updateSettings(settings.value);
    }

    async function toggleDarkMode() {
        settings.value.darkMode = !settings.value.darkMode;
        // Apply dark mode class to html element
        document.documentElement.classList.toggle('dark', settings.value.darkMode);
        saveSettings();
    }

    async function setMonthlyBudget(budget: number) {
        await updateSettings({ monthlyBudget: budget });
    }

    async function setSavingsGoal(percentage: number) {
        await updateSettings({ savingsGoalPercentage: percentage });
    }

    return {
        settings,
        loading,
        initialized,
        loadSettings,
        updateSettings,
        toggleDarkMode,
        setMonthlyBudget,
        setSavingsGoal
    };
});
