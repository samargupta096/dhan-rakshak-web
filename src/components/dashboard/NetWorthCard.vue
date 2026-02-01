<script setup lang="ts">
import { computed } from 'vue';
import { usePortfolioStore } from '@/stores/portfolio';
import { formatCurrency, formatPercentage } from '@/utils/formatters';

const portfolioStore = usePortfolioStore();

const formattedNetWorth = computed(() => formatCurrency(portfolioStore.netWorth));
const formattedGain = computed(() => formatCurrency(portfolioStore.totalGain));
const formattedGainPercentage = computed(() => formatPercentage(portfolioStore.gainPercentage));
const isPositive = computed(() => portfolioStore.totalGain >= 0);
</script>

<template>
  <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 via-primary-700 to-accent-600 p-6 shadow-2xl">
    <!-- Background decoration -->
    <div class="absolute -top-12 -right-12 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
    <div class="absolute -bottom-8 -left-8 w-32 h-32 bg-accent-400/20 rounded-full blur-xl"></div>
    
    <!-- Content -->
    <div class="relative z-10">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-2xl">💎</span>
        <p class="text-sm text-white/80 font-medium">Total Net Worth</p>
      </div>
      
      <h2 class="text-4xl font-bold text-white mb-3 tracking-tight">
        {{ formattedNetWorth }}
      </h2>
      
      <div 
        class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full"
        :class="isPositive ? 'bg-green-500/20' : 'bg-red-500/20'"
      >
        <span :class="isPositive ? 'text-green-300' : 'text-red-300'">
          {{ isPositive ? '📈' : '📉' }}
        </span>
        <span 
          class="font-semibold"
          :class="isPositive ? 'text-green-300' : 'text-red-300'"
        >
          {{ formattedGain }}
        </span>
        <span 
          class="text-sm"
          :class="isPositive ? 'text-green-300/80' : 'text-red-300/80'"
        >
          ({{ formattedGainPercentage }})
        </span>
      </div>
      
      <!-- Quick Stats -->
      <div class="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-white/20">
        <div>
          <p class="text-xs text-white/60 mb-1">Invested</p>
          <p class="text-lg font-semibold text-white">{{ formatCurrency(portfolioStore.totalInvested, true) }}</p>
        </div>
        <div>
          <p class="text-xs text-white/60 mb-1">Assets</p>
          <p class="text-lg font-semibold text-white">{{ portfolioStore.assets.length }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
