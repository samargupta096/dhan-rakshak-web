import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { db } from '@/services/db/indexedDb';
import type { Transaction, TransactionType } from '@/types';

export const useTransactionsStore = defineStore('transactions', () => {
    const transactions = ref<Transaction[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);

    // Computed properties
    const totalIncome = computed(() =>
        transactions.value
            .filter(t => t.type === 'CREDIT')
            .reduce((sum, t) => sum + t.amount, 0)
    );

    const totalExpenses = computed(() =>
        transactions.value
            .filter(t => t.type === 'DEBIT')
            .reduce((sum, t) => sum + t.amount, 0)
    );

    const balance = computed(() => totalIncome.value - totalExpenses.value);

    const recentTransactions = computed(() =>
        [...transactions.value]
            .sort((a, b) => b.date - a.date)
            .slice(0, 10)
    );

    const thisMonthTransactions = computed(() => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
        return transactions.value.filter(t => t.date >= startOfMonth);
    });

    const thisMonthExpenses = computed(() =>
        thisMonthTransactions.value
            .filter(t => t.type === 'DEBIT')
            .reduce((sum, t) => sum + t.amount, 0)
    );

    const thisMonthIncome = computed(() =>
        thisMonthTransactions.value
            .filter(t => t.type === 'CREDIT')
            .reduce((sum, t) => sum + t.amount, 0)
    );

    const expensesByCategory = computed(() => {
        const grouped: Record<string, number> = {};
        transactions.value
            .filter(t => t.type === 'DEBIT')
            .forEach(t => {
                grouped[t.category] = (grouped[t.category] || 0) + t.amount;
            });
        return Object.entries(grouped)
            .map(([category, amount]) => ({ category, amount }))
            .sort((a, b) => b.amount - a.amount);
    });

    // Actions
    async function loadTransactions() {
        loading.value = true;
        error.value = null;
        try {
            transactions.value = await db.transactions.toArray();
        } catch (e) {
            error.value = 'Failed to load transactions';
            console.error(e);
        } finally {
            loading.value = false;
        }
    }

    async function addTransaction(transaction: Omit<Transaction, 'id' | 'createdAt'>) {
        try {
            const id = await db.transactions.add({
                ...transaction,
                createdAt: Date.now()
            });
            await loadTransactions();
            return id;
        } catch (e) {
            error.value = 'Failed to add transaction';
            console.error(e);
            throw e;
        }
    }

    async function updateTransaction(id: number, updates: Partial<Transaction>) {
        try {
            await db.transactions.update(id, updates);
            await loadTransactions();
        } catch (e) {
            error.value = 'Failed to update transaction';
            console.error(e);
            throw e;
        }
    }

    async function deleteTransaction(id: number) {
        try {
            await db.transactions.delete(id);
            await loadTransactions();
        } catch (e) {
            error.value = 'Failed to delete transaction';
            console.error(e);
            throw e;
        }
    }

    return {
        transactions,
        loading,
        error,
        totalIncome,
        totalExpenses,
        balance,
        recentTransactions,
        thisMonthTransactions,
        thisMonthExpenses,
        thisMonthIncome,
        expensesByCategory,
        loadTransactions,
        addTransaction,
        updateTransaction,
        deleteTransaction
    };
});
