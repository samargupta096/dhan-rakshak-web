<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { usePortfolioStore } from '@/stores/portfolio';
import { useTransactionsStore } from '@/stores/transactions';
import { useSettingsStore } from '@/stores/settings';
import { formatCurrency, formatPercentage } from '@/utils/formatters';
import { marketApi, type MarketData } from '@/services/api/marketApi';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  PointElement,
  LineElement,
  Filler
} from 'chart.js';
import { Bar, Doughnut, Line } from 'vue-chartjs';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement, Filler);

const portfolioStore = usePortfolioStore();
const transactionsStore = useTransactionsStore();
const settingsStore = useSettingsStore();

const marketData = ref<MarketData[]>([]);
const loadingMarketData = ref(true);

onMounted(async () => {
  await Promise.all([
    portfolioStore.loadAssets(),
    transactionsStore.loadTransactions()
  ]);
  
  try {
    marketData.value = await marketApi.getMarketOverview();
  } catch (e) {
    console.error('Failed to load market data', e);
  } finally {
    loadingMarketData.value = false;
  }
});

// --- Charts Data ---

const incomeExpenseData = computed(() => {
  const income = transactionsStore.thisMonthIncome;
  const expense = transactionsStore.thisMonthExpenses;
  
  return {
    labels: ['Income', 'Expenses'],
    datasets: [{
      label: 'This Month',
      data: [income, expense],
      backgroundColor: ['#10b981', '#ef4444'],
      borderRadius: 8
    }]
  };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      callbacks: {
        label: (context: any) => formatCurrency(context.raw)
      }
    }
  },
  scales: {
    y: {
      grid: {
        color: 'rgba(255, 255, 255, 0.1)'
      },
      ticks: {
        color: '#9ca3af',
        callback: (value: any) => formatCurrency(value, true)
      }
    },
    x: {
      grid: {
        display: false
      },
      ticks: {
        color: '#9ca3af'
      }
    }
  }
};

const expenseBreakdownData = computed(() => {
  const topCategories = transactionsStore.expensesByCategory.slice(0, 5);
  return {
    labels: topCategories.map(c => c.category),
    datasets: [{
      data: topCategories.map(c => c.amount),
      backgroundColor: [
        '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'
      ],
      borderWidth: 0
    }]
  };
});

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'right' as const,
      labels: {
        color: '#9ca3af',
        usePointStyle: true,
        padding: 20
      }
    }
  },
  cutout: '70%'
};

// --- Widgets ---

const savingsRate = computed(() => {
  const income = transactionsStore.thisMonthIncome;
  const expense = transactionsStore.thisMonthExpenses;
  if (income === 0) return 0;
  return ((income - expense) / income) * 100;
});

const highestExpenseCategory = computed(() => {
  return transactionsStore.expensesByCategory[0] || null;
});

// Risk Analysis
const riskScore = computed(() => {
  const allocation = portfolioStore.assetAllocation;
  let score = 50; 
  const highRisk = allocation.filter(a => ['STOCK', 'CRYPTO'].includes(a.type));
  const highRiskPercentage = highRisk.reduce((sum, a) => sum + a.percentage, 0);
  const lowRisk = allocation.filter(a => ['FD', 'PPF', 'EPF', 'RD'].includes(a.type));
  const lowRiskPercentage = lowRisk.reduce((sum, a) => sum + a.percentage, 0);
  score += (highRiskPercentage - lowRiskPercentage) * 0.5;
  return Math.max(0, Math.min(100, score));
});

const riskLevel = computed(() => {
  if (riskScore.value < 30) return { label: 'Conservative', color: 'text-green-400', bg: 'bg-green-500' };
  if (riskScore.value < 60) return { label: 'Moderate', color: 'text-yellow-400', bg: 'bg-yellow-500' };
  return { label: 'Aggressive', color: 'text-red-400', bg: 'bg-red-500' };
});

</script>

<template>
  <div class="space-y-6 animate-fade-in pb-20">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-bold text-white">Financial Insights 💡</h1>
      <p class="text-gray-400 mt-1">Market trends and personal finance analysis</p>
    </div>

    <!-- Market Overview -->
    <div class="overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
      <div v-if="loadingMarketData" class="flex gap-4">
        <div v-for="i in 4" :key="i" class="min-w-[160px] h-24 bg-dark-700/50 rounded-xl animate-pulse"></div>
      </div>
      <div v-else class="flex gap-4">
        <div 
          v-for="item in marketData" 
          :key="item.symbol"
          class="min-w-[160px] p-4 bg-dark-800 border border-white/5 rounded-xl hover:border-primary-500/20 transition-all"
        >
          <div class="flex justify-between items-start mb-2">
            <span class="text-xs font-bold text-gray-400">{{ item.symbol }}</span>
            <span 
              class="text-xs font-medium px-1.5 py-0.5 rounded"
              :class="item.change >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'"
            >
              {{ formatPercentage(item.changePercent) }}
            </span>
          </div>
          <p class="text-lg font-bold text-white">{{ formatCurrency(item.price) }}</p>
          <p 
            class="text-xs mt-1"
            :class="item.change >= 0 ? 'text-green-400' : 'text-red-400'"
          >
            {{ item.change >= 0 ? '+' : '' }}{{ formatCurrency(item.change) }}
          </p>
        </div>
      </div>
    </div>

    <!-- Main Grid -->
    <div class="grid lg:grid-cols-2 gap-6">
      
      <!-- Income vs Expense Chart -->
      <div class="bg-dark-800 rounded-2xl p-6 border border-white/5">
        <h3 class="text-lg font-semibold text-white mb-6 flex items-center gap-2">
          <span>💰</span> Cash Flow
        </h3>
        <div class="h-64">
          <Bar :data="incomeExpenseData" :options="chartOptions" />
        </div>
      </div>

      <!-- Expense Breakdown -->
      <div class="bg-dark-800 rounded-2xl p-6 border border-white/5">
        <h3 class="text-lg font-semibold text-white mb-6 flex items-center gap-2">
          <span>📉</span> Spending Breakdown
        </h3>
        <div class="h-64">
          <Doughnut :data="expenseBreakdownData" :options="doughnutOptions" />
        </div>
      </div>

      <!-- Key Metrics Widgets -->
      <div class="bg-dark-800 rounded-2xl p-6 border border-white/5 flex flex-col justify-between">
        <h3 class="text-lg font-semibold text-white mb-4">Key Metrics</h3>
        <div class="grid grid-cols-2 gap-4">
          <div class="p-4 rounded-xl bg-dark-700/30">
            <p class="text-sm text-gray-400 mb-1">Savings Rate</p>
            <p 
              class="text-2xl font-bold"
              :class="savingsRate >= 20 ? 'text-green-400' : 'text-yellow-400'"
            >
              {{ Math.round(savingsRate) }}%
            </p>
            <p class="text-xs text-gray-500 mt-1">Goal: 20%</p>
          </div>
          <div class="p-4 rounded-xl bg-dark-700/30">
            <p class="text-sm text-gray-400 mb-1">Top Expense</p>
            <template v-if="highestExpenseCategory">
              <p class="text-xl font-bold text-white truncate">{{ highestExpenseCategory.category }}</p>
              <p class="text-xs text-gray-500 mt-1">{{ formatCurrency(highestExpenseCategory.amount) }}</p>
            </template>
            <p v-else class="text-xl font-bold text-gray-500">-</p>
          </div>
        </div>
      </div>

      <!-- Risk Profile -->
      <div class="bg-dark-800 rounded-2xl p-6 border border-white/5">
         <h3 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span>🎚️</span> Risk Profile
        </h3>
        <div class="flex items-center gap-6 mt-4">
           <!-- Gauge -->
          <div class="relative w-32 h-32 flex-shrink-0">
            <svg class="w-32 h-32 transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="#1f2937"
                stroke-width="12"
                fill="none"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                :stroke="riskLevel.bg.replace('bg-', '#').replace('-500', '')"
                stroke-width="12"
                fill="none"
                stroke-linecap="round"
                :stroke-dasharray="`${(riskScore / 100) * 352} 352`"
                class="transition-all duration-1000"
              />
            </svg>
            <div class="absolute inset-0 flex flex-col items-center justify-center">
              <span class="text-2xl font-bold text-white">{{ riskScore.toFixed(0) }}</span>
              <span class="text-xs text-gray-500">/ 100</span>
            </div>
          </div>
           <div>
            <p class="text-2xl font-bold" :class="riskLevel.color">{{ riskLevel.label }}</p>
            <p class="text-gray-400 mt-2 text-sm">
              Your portfolio has a {{ riskLevel.label.toLowerCase() }} risk profile based on your asset allocation.
            </p>
          </div>
        </div>
      </div>
      
    </div>
  </div>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
    display: none;
}
.scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
</style>

