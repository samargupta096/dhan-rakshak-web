<script setup lang="ts">
import { computed } from 'vue';
import { useTransactionsStore } from '@/stores/transactions';
import { formatCurrency, formatDate, getCategoryIcon } from '@/utils/formatters';

const transactionsStore = useTransactionsStore();

const recentTransactions = computed(() => transactionsStore.recentTransactions.slice(0, 5));
</script>

<template>
  <div class="bg-dark-800 rounded-2xl p-5 border border-white/5">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-white flex items-center gap-2">
        <span>📜</span>
        Recent Transactions
      </h3>
      <router-link 
        to="/transactions" 
        class="text-sm text-primary-400 hover:text-primary-300 transition-colors"
      >
        View All →
      </router-link>
    </div>
    
    <div v-if="recentTransactions.length > 0" class="space-y-3">
      <div 
        v-for="transaction in recentTransactions" 
        :key="transaction.id"
        class="flex items-center justify-between p-3 rounded-xl bg-dark-700/50 hover:bg-dark-700 transition-colors group"
      >
        <div class="flex items-center gap-3">
          <div 
            class="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
            :class="transaction.type === 'CREDIT' ? 'bg-green-500/20' : 'bg-red-500/20'"
          >
            {{ getCategoryIcon(transaction.category) }}
          </div>
          <div>
            <p class="text-sm font-medium text-white group-hover:text-primary-300 transition-colors">
              {{ transaction.description || transaction.category }}
            </p>
            <p class="text-xs text-gray-500">{{ formatDate(transaction.date, 'relative') }}</p>
          </div>
        </div>
        <div class="text-right">
          <p 
            class="font-semibold"
            :class="transaction.type === 'CREDIT' ? 'text-green-400' : 'text-red-400'"
          >
            {{ transaction.type === 'CREDIT' ? '+' : '-' }}{{ formatCurrency(transaction.amount) }}
          </p>
          <p class="text-xs text-gray-500">{{ transaction.category }}</p>
        </div>
      </div>
    </div>
    
    <!-- Empty state -->
    <div v-else class="text-center py-8">
      <span class="text-4xl mb-3 block">📭</span>
      <p class="text-gray-400 mb-2">No transactions yet</p>
      <p class="text-sm text-gray-500">Your recent activity will appear here</p>
    </div>
  </div>
</template>
