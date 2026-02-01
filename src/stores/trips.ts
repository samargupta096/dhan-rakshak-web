import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { db } from '@/services/db/indexedDb';
import type { Trip } from '@/types';

export const useTripsStore = defineStore('trips', () => {
    const trips = ref<Trip[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);

    // Computed properties
    const totalBudget = computed(() =>
        trips.value.reduce((sum, t) => sum + t.budget, 0)
    );

    const totalSpent = computed(() =>
        trips.value.reduce((sum, t) => sum + t.spent, 0)
    );

    const upcomingTrips = computed(() => {
        const now = Date.now();
        return trips.value
            .filter(t => t.startDate > now)
            .sort((a, b) => a.startDate - b.startDate);
    });

    const currentTrips = computed(() => {
        const now = Date.now();
        return trips.value.filter(t => t.startDate <= now && t.endDate >= now);
    });

    const pastTrips = computed(() => {
        const now = Date.now();
        return trips.value
            .filter(t => t.endDate < now)
            .sort((a, b) => b.endDate - a.endDate);
    });

    // Actions
    async function loadTrips() {
        loading.value = true;
        error.value = null;
        try {
            trips.value = await db.trips.toArray();
        } catch (e) {
            error.value = 'Failed to load trips';
            console.error(e);
        } finally {
            loading.value = false;
        }
    }

    async function addTrip(trip: Omit<Trip, 'id' | 'createdAt'>) {
        try {
            const id = await db.trips.add({
                ...trip,
                createdAt: Date.now()
            });
            await loadTrips();
            return id;
        } catch (e) {
            error.value = 'Failed to add trip';
            console.error(e);
            throw e;
        }
    }

    async function updateTrip(id: number, updates: Partial<Trip>) {
        try {
            await db.trips.update(id, updates);
            await loadTrips();
        } catch (e) {
            error.value = 'Failed to update trip';
            console.error(e);
            throw e;
        }
    }

    async function addExpenseToTrip(id: number, amount: number) {
        const trip = trips.value.find(t => t.id === id);
        if (trip) {
            await updateTrip(id, { spent: trip.spent + amount });
        }
    }

    async function deleteTrip(id: number) {
        try {
            await db.trips.delete(id);
            await loadTrips();
        } catch (e) {
            error.value = 'Failed to delete trip';
            console.error(e);
            throw e;
        }
    }

    return {
        trips,
        loading,
        error,
        totalBudget,
        totalSpent,
        upcomingTrips,
        currentTrips,
        pastTrips,
        loadTrips,
        addTrip,
        updateTrip,
        addExpenseToTrip,
        deleteTrip
    };
});
