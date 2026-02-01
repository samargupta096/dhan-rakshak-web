import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { db } from '@/services/db/indexedDb';
import type { Reminder } from '@/types';

export const useRemindersStore = defineStore('reminders', () => {
    const reminders = ref<Reminder[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);

    // Computed properties
    const activeReminders = computed(() =>
        reminders.value.filter(r => r.isEnabled)
    );

    const upcomingReminders = computed(() => {
        const now = Date.now();
        const oneDayMs = 24 * 60 * 60 * 1000;
        return activeReminders.value
            .filter(r => r.reminderTime > now && r.reminderTime <= now + (7 * oneDayMs))
            .sort((a, b) => a.reminderTime - b.reminderTime);
    });

    const overdueReminders = computed(() => {
        const now = Date.now();
        return activeReminders.value
            .filter(r => r.reminderTime < now && r.frequency === 'ONCE')
            .sort((a, b) => a.reminderTime - b.reminderTime);
    });

    const billReminders = computed(() =>
        reminders.value.filter(r => r.category === 'BILL')
    );

    const totalMonthlyBills = computed(() =>
        billReminders.value
            .filter(r => r.isEnabled)
            .reduce((sum, r) => sum + (r.amount || 0), 0)
    );

    // Actions
    async function loadReminders() {
        loading.value = true;
        error.value = null;
        try {
            reminders.value = await db.reminders.toArray();
        } catch (e) {
            error.value = 'Failed to load reminders';
            console.error(e);
        } finally {
            loading.value = false;
        }
    }

    async function addReminder(reminder: Omit<Reminder, 'id' | 'createdAt'>) {
        try {
            const id = await db.reminders.add({
                ...reminder,
                createdAt: Date.now()
            });
            await loadReminders();
            return id;
        } catch (e) {
            error.value = 'Failed to add reminder';
            console.error(e);
            throw e;
        }
    }

    async function updateReminder(id: number, updates: Partial<Reminder>) {
        try {
            await db.reminders.update(id, updates);
            await loadReminders();
        } catch (e) {
            error.value = 'Failed to update reminder';
            console.error(e);
            throw e;
        }
    }

    async function toggleReminder(id: number) {
        const reminder = reminders.value.find(r => r.id === id);
        if (reminder) {
            await updateReminder(id, { isEnabled: !reminder.isEnabled });
        }
    }

    async function deleteReminder(id: number) {
        try {
            await db.reminders.delete(id);
            await loadReminders();
        } catch (e) {
            error.value = 'Failed to delete reminder';
            console.error(e);
            throw e;
        }
    }

    return {
        reminders,
        loading,
        error,
        activeReminders,
        upcomingReminders,
        overdueReminders,
        billReminders,
        totalMonthlyBills,
        loadReminders,
        addReminder,
        updateReminder,
        toggleReminder,
        deleteReminder
    };
});
