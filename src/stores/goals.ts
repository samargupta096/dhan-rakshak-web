import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { db } from '@/services/db/indexedDb';
import type { FinancialGoal } from '@/types';

export const useGoalsStore = defineStore('goals', () => {
    const goals = ref<FinancialGoal[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);

    // Computed properties
    const totalTargetAmount = computed(() =>
        goals.value.reduce((sum, g) => sum + g.targetAmount, 0)
    );

    const totalCurrentAmount = computed(() =>
        goals.value.reduce((sum, g) => sum + g.currentAmount, 0)
    );

    const overallProgress = computed(() =>
        totalTargetAmount.value > 0
            ? (totalCurrentAmount.value / totalTargetAmount.value) * 100
            : 0
    );

    const activeGoals = computed(() =>
        goals.value.filter(g => g.currentAmount < g.targetAmount)
    );

    const completedGoals = computed(() =>
        goals.value.filter(g => g.currentAmount >= g.targetAmount)
    );

    const upcomingGoals = computed(() =>
        [...activeGoals.value]
            .sort((a, b) => a.targetDate - b.targetDate)
            .slice(0, 5)
    );

    // Actions
    async function loadGoals() {
        loading.value = true;
        error.value = null;
        try {
            goals.value = await db.goals.toArray();
        } catch (e) {
            error.value = 'Failed to load goals';
            console.error(e);
        } finally {
            loading.value = false;
        }
    }

    async function addGoal(goal: Omit<FinancialGoal, 'id' | 'createdAt'>) {
        try {
            const id = await db.goals.add({
                ...goal,
                createdAt: Date.now()
            });
            await loadGoals();
            return id;
        } catch (e) {
            error.value = 'Failed to add goal';
            console.error(e);
            throw e;
        }
    }

    async function updateGoal(id: number, updates: Partial<FinancialGoal>) {
        try {
            await db.goals.update(id, updates);
            await loadGoals();
        } catch (e) {
            error.value = 'Failed to update goal';
            console.error(e);
            throw e;
        }
    }

    async function addToGoal(id: number, amount: number) {
        const goal = goals.value.find(g => g.id === id);
        if (goal) {
            await updateGoal(id, { currentAmount: goal.currentAmount + amount });
        }
    }

    async function deleteGoal(id: number) {
        try {
            await db.goals.delete(id);
            await loadGoals();
        } catch (e) {
            error.value = 'Failed to delete goal';
            console.error(e);
            throw e;
        }
    }

    return {
        goals,
        loading,
        error,
        totalTargetAmount,
        totalCurrentAmount,
        overallProgress,
        activeGoals,
        completedGoals,
        upcomingGoals,
        loadGoals,
        addGoal,
        updateGoal,
        addToGoal,
        deleteGoal
    };
});
