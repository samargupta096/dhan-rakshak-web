<script setup lang="ts">
import { onMounted } from 'vue';
import { usePortfolioStore } from '@/stores/portfolio';
import { useTransactionsStore } from '@/stores/transactions';
import { useGoalsStore } from '@/stores/goals';
import { useRemindersStore } from '@/stores/reminders';
import { NetWorthCard, AssetPieChart, RecentTransactions } from '@/components/dashboard';
import { formatCurrency } from '@/utils/formatters';

const portfolioStore = usePortfolioStore();
const transactionsStore = useTransactionsStore();
const goalsStore = useGoalsStore();
const remindersStore = useRemindersStore();

onMounted(async () => {
  await Promise.all([
    portfolioStore.loadAssets(),
    transactionsStore.loadTransactions(),
    goalsStore.loadGoals(),
    remindersStore.loadReminders()
  ]);
});
</script>

<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Welcome Section -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-white">Welcome back! 👋</h1>
        <p class="text-gray-400 mt-1">Here's your financial overview</p>
      </div>
      <div class="text-right hidden sm:block">
        <p class="text-sm text-gray-500">{{ new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' }) }}</p>
      </div>
    </div>

    <!-- Net Worth Card -->
    <NetWorthCard />

    <!-- Quick Stats -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div class="bg-dark-800 rounded-xl p-4 border border-white/5">
        <div class="flex items-center gap-2 mb-2">
          <span class="text-lg">💸</span>
          <span class="text-xs text-gray-500">This Month</span>
        </div>
        <p class="text-lg font-bold text-red-400">{{ formatCurrency(transactionsStore.thisMonthExpenses, true) }}</p>
        <p class="text-xs text-gray-500">Expenses</p>
      </div>
      
      <div class="bg-dark-800 rounded-xl p-4 border border-white/5">
        <div class="flex items-center gap-2 mb-2">
          <span class="text-lg">💰</span>
          <span class="text-xs text-gray-500">This Month</span>
        </div>
        <p class="text-lg font-bold text-green-400">{{ formatCurrency(transactionsStore.thisMonthIncome, true) }}</p>
        <p class="text-xs text-gray-500">Income</p>
      </div>
      
      <div class="bg-dark-800 rounded-xl p-4 border border-white/5">
        <div class="flex items-center gap-2 mb-2">
          <span class="text-lg">🎯</span>
          <span class="text-xs text-gray-500">Progress</span>
        </div>
        <p class="text-lg font-bold text-primary-400">{{ goalsStore.overallProgress.toFixed(0) }}%</p>
        <p class="text-xs text-gray-500">Goals</p>
      </div>
      
      <div class="bg-dark-800 rounded-xl p-4 border border-white/5">
        <div class="flex items-center gap-2 mb-2">
          <span class="text-lg">🔔</span>
          <span class="text-xs text-gray-500">Upcoming</span>
        </div>
        <p class="text-lg font-bold text-accent-400">{{ remindersStore.upcomingReminders.length }}</p>
        <p class="text-xs text-gray-500">Reminders</p>
      </div>
    </div>

    <!-- Charts Row -->
    <div class="grid lg:grid-cols-2 gap-6">
      <AssetPieChart />
      <RecentTransactions />
    </div>

    <!-- Quick Actions -->
    <div class="bg-dark-800 rounded-2xl p-5 border border-white/5">
      <h3 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <span>⚡</span>
        Quick Actions
      </h3>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <router-link 
          to="/portfolio"
          class="flex flex-col items-center gap-2 p-4 rounded-xl bg-dark-700/50 hover:bg-primary-500/20 border border-white/5 hover:border-primary-500/30 transition-all group"
        >
          <span class="text-2xl group-hover:scale-110 transition-transform">📈</span>
          <span class="text-sm text-gray-300 group-hover:text-white">Add Investment</span>
        </router-link>
        
        <router-link 
          to="/transactions"
          class="flex flex-col items-center gap-2 p-4 rounded-xl bg-dark-700/50 hover:bg-accent-500/20 border border-white/5 hover:border-accent-500/30 transition-all group"
        >
          <span class="text-2xl group-hover:scale-110 transition-transform">💳</span>
          <span class="text-sm text-gray-300 group-hover:text-white">Add Expense</span>
        </router-link>
        
        <router-link 
          to="/goals"
          class="flex flex-col items-center gap-2 p-4 rounded-xl bg-dark-700/50 hover:bg-green-500/20 border border-white/5 hover:border-green-500/30 transition-all group"
        >
          <span class="text-2xl group-hover:scale-110 transition-transform">🎯</span>
          <span class="text-sm text-gray-300 group-hover:text-white">Set Goal</span>
        </router-link>
        
        <router-link 
          to="/reminders"
          class="flex flex-col items-center gap-2 p-4 rounded-xl bg-dark-700/50 hover:bg-yellow-500/20 border border-white/5 hover:border-yellow-500/30 transition-all group"
        >
          <span class="text-2xl group-hover:scale-110 transition-transform">⏰</span>
          <span class="text-sm text-gray-300 group-hover:text-white">Add Reminder</span>
        </router-link>
      </div>
    </div>
  </div>
</template>
