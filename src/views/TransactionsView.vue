<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useTransactionsStore } from '@/stores/transactions';
import Modal from '@/components/common/Modal.vue';
import { formatCurrency, formatDate, getCategoryIcon } from '@/utils/formatters';
import type { TransactionType } from '@/types';

const transactionsStore = useTransactionsStore();

const showAddModal = ref(false);
const activeFilter = ref<TransactionType | 'ALL'>('ALL');

const form = ref({
  amount: 0,
  type: 'DEBIT' as TransactionType,
  category: 'OTHER',
  description: '',
  date: new Date().toISOString().split('T')[0]
});

const categories = [
  { value: 'FOOD', label: 'Food & Dining', icon: '🍔' },
  { value: 'TRANSPORT', label: 'Transport', icon: '🚗' },
  { value: 'SHOPPING', label: 'Shopping', icon: '🛒' },
  { value: 'ENTERTAINMENT', label: 'Entertainment', icon: '🎬' },
  { value: 'BILLS', label: 'Bills', icon: '📄' },
  { value: 'HEALTH', label: 'Health', icon: '🏥' },
  { value: 'EDUCATION', label: 'Education', icon: '📚' },
  { value: 'TRAVEL', label: 'Travel', icon: '✈️' },
  { value: 'SALARY', label: 'Salary', icon: '💰' },
  { value: 'INVESTMENT', label: 'Investment', icon: '📈' },
  { value: 'RENT', label: 'Rent', icon: '🏠' },
  { value: 'UTILITIES', label: 'Utilities', icon: '💡' },
  { value: 'OTHER', label: 'Other', icon: '📌' }
];

const filteredTransactions = computed(() => {
  if (activeFilter.value === 'ALL') {
    return [...transactionsStore.transactions].sort((a, b) => b.date - a.date);
  }
  return transactionsStore.transactions
    .filter(t => t.type === activeFilter.value)
    .sort((a, b) => b.date - a.date);
});

onMounted(() => {
  transactionsStore.loadTransactions();
});

async function handleSubmit() {
  if (form.value.amount <= 0) return;
  
  await transactionsStore.addTransaction({
    amount: form.value.amount,
    type: form.value.type,
    category: form.value.category,
    description: form.value.description,
    date: new Date(form.value.date || Date.now()).getTime()
  });
  
  // Reset form
  form.value = {
    amount: 0,
    type: 'DEBIT',
    category: 'OTHER',
    description: '',
    date: new Date().toISOString().split('T')[0]
  };
  
  showAddModal.value = false;
}

async function handleDelete(id: number) {
  if (confirm('Delete this transaction?')) {
    await transactionsStore.deleteTransaction(id);
  }
}
</script>

<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-white">Transactions 💳</h1>
        <p class="text-gray-400 mt-1">Track your income and expenses</p>
      </div>
      <button
        @click="showAddModal = true"
        class="px-6 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold hover:from-primary-600 hover:to-accent-600 transition-all shadow-lg shadow-primary-500/25 flex items-center gap-2"
      >
        <span>➕</span>
        Add Transaction
      </button>
    </div>

    <!-- Summary Cards -->
    <div class="grid sm:grid-cols-3 gap-4">
      <div class="bg-dark-800 rounded-xl p-5 border border-white/5">
        <p class="text-sm text-gray-500 mb-1">Total Income</p>
        <p class="text-2xl font-bold text-green-400">{{ formatCurrency(transactionsStore.totalIncome, true) }}</p>
      </div>
      <div class="bg-dark-800 rounded-xl p-5 border border-white/5">
        <p class="text-sm text-gray-500 mb-1">Total Expenses</p>
        <p class="text-2xl font-bold text-red-400">{{ formatCurrency(transactionsStore.totalExpenses, true) }}</p>
      </div>
      <div class="bg-dark-800 rounded-xl p-5 border border-white/5">
        <p class="text-sm text-gray-500 mb-1">Balance</p>
        <p 
          class="text-2xl font-bold"
          :class="transactionsStore.balance >= 0 ? 'text-green-400' : 'text-red-400'"
        >
          {{ formatCurrency(transactionsStore.balance, true) }}
        </p>
      </div>
    </div>

    <!-- Filters -->
    <div class="flex gap-2">
      <button
        @click="activeFilter = 'ALL'"
        class="px-4 py-2 rounded-xl text-sm font-medium transition-all"
        :class="activeFilter === 'ALL' ? 'bg-primary-500 text-white' : 'bg-dark-700 text-gray-400 hover:bg-dark-600'"
      >
        All
      </button>
      <button
        @click="activeFilter = 'CREDIT'"
        class="px-4 py-2 rounded-xl text-sm font-medium transition-all"
        :class="activeFilter === 'CREDIT' ? 'bg-green-500 text-white' : 'bg-dark-700 text-gray-400 hover:bg-dark-600'"
      >
        💰 Income
      </button>
      <button
        @click="activeFilter = 'DEBIT'"
        class="px-4 py-2 rounded-xl text-sm font-medium transition-all"
        :class="activeFilter === 'DEBIT' ? 'bg-red-500 text-white' : 'bg-dark-700 text-gray-400 hover:bg-dark-600'"
      >
        💸 Expense
      </button>
    </div>

    <!-- Transactions List -->
    <div v-if="filteredTransactions.length > 0" class="space-y-3">
      <div 
        v-for="transaction in filteredTransactions" 
        :key="transaction.id"
        class="flex items-center justify-between p-4 rounded-xl bg-dark-800 border border-white/5 hover:border-primary-500/30 transition-all group"
      >
        <div class="flex items-center gap-4">
          <div 
            class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
            :class="transaction.type === 'CREDIT' ? 'bg-green-500/20' : 'bg-red-500/20'"
          >
            {{ getCategoryIcon(transaction.category) }}
          </div>
          <div>
            <p class="font-medium text-white">{{ transaction.description || transaction.category }}</p>
            <p class="text-sm text-gray-500">{{ formatDate(transaction.date) }} • {{ transaction.category }}</p>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <p 
            class="text-lg font-bold"
            :class="transaction.type === 'CREDIT' ? 'text-green-400' : 'text-red-400'"
          >
            {{ transaction.type === 'CREDIT' ? '+' : '-' }}{{ formatCurrency(transaction.amount) }}
          </p>
          <button 
            @click="handleDelete(transaction.id!)"
            class="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-all"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-16">
      <span class="text-6xl mb-4 block">📭</span>
      <h3 class="text-xl font-semibold text-white mb-2">No transactions yet</h3>
      <p class="text-gray-400 mb-6">Start tracking your finances</p>
      <button
        @click="showAddModal = true"
        class="px-6 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold"
      >
        Add First Transaction
      </button>
    </div>

    <!-- Add Transaction Modal -->
    <Modal v-model="showAddModal" title="Add Transaction" size="md">
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- Type Toggle -->
        <div class="flex gap-2">
          <button
            type="button"
            @click="form.type = 'DEBIT'"
            class="flex-1 py-3 rounded-xl font-medium transition-all"
            :class="form.type === 'DEBIT' ? 'bg-red-500 text-white' : 'bg-dark-700 text-gray-400'"
          >
            💸 Expense
          </button>
          <button
            type="button"
            @click="form.type = 'CREDIT'"
            class="flex-1 py-3 rounded-xl font-medium transition-all"
            :class="form.type === 'CREDIT' ? 'bg-green-500 text-white' : 'bg-dark-700 text-gray-400'"
          >
            💰 Income
          </button>
        </div>

        <!-- Amount -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">Amount (₹)</label>
          <input
            v-model.number="form.amount"
            type="number"
            min="0"
            step="any"
            class="w-full px-4 py-3 rounded-xl bg-dark-700 border border-white/10 text-white text-xl font-bold text-center focus:border-primary-500 focus:outline-none"
            placeholder="0"
            required
          />
        </div>

        <!-- Category -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">Category</label>
          <div class="grid grid-cols-4 gap-2">
            <button
              v-for="cat in categories"
              :key="cat.value"
              type="button"
              @click="form.category = cat.value"
              class="p-2 rounded-xl text-center transition-all"
              :class="form.category === cat.value ? 'bg-primary-500 text-white' : 'bg-dark-700 text-gray-400 hover:bg-dark-600'"
            >
              <span class="text-xl block">{{ cat.icon }}</span>
              <span class="text-[10px]">{{ cat.label }}</span>
            </button>
          </div>
        </div>

        <!-- Description -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">Description</label>
          <input
            v-model="form.description"
            type="text"
            class="w-full px-4 py-3 rounded-xl bg-dark-700 border border-white/10 text-white focus:border-primary-500 focus:outline-none"
            placeholder="What was this for?"
          />
        </div>

        <!-- Date -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">Date</label>
          <input
            v-model="form.date"
            type="date"
            class="w-full px-4 py-3 rounded-xl bg-dark-700 border border-white/10 text-white focus:border-primary-500 focus:outline-none"
          />
        </div>
      </form>

      <template #footer>
        <button
          @click="handleSubmit"
          :disabled="form.amount <= 0"
          class="w-full py-3 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold disabled:opacity-50"
        >
          Add Transaction
        </button>
      </template>
    </Modal>
  </div>
</template>
