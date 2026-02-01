<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { Doughnut } from 'vue-chartjs';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { usePortfolioStore } from '@/stores/portfolio';
import { formatCurrency, getAssetTypeName } from '@/utils/formatters';

ChartJS.register(ArcElement, Tooltip, Legend);

const portfolioStore = usePortfolioStore();

const chartData = computed(() => {
  const allocation = portfolioStore.assetAllocation;
  
  return {
    labels: allocation.map(a => getAssetTypeName(a.type)),
    datasets: [{
      data: allocation.map(a => a.value),
      backgroundColor: allocation.map(a => a.color),
      borderColor: 'transparent',
      borderWidth: 0,
      hoverOffset: 8
    }]
  };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: true,
  cutout: '65%',
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      backgroundColor: 'rgba(15, 15, 35, 0.9)',
      titleColor: '#fff',
      bodyColor: '#fff',
      borderColor: 'rgba(255,255,255,0.1)',
      borderWidth: 1,
      cornerRadius: 8,
      padding: 12,
      callbacks: {
        label: (context: any) => {
          const value = context.raw;
          const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
          const percentage = ((value / total) * 100).toFixed(1);
          return `${formatCurrency(value)} (${percentage}%)`;
        }
      }
    }
  }
};
</script>

<template>
  <div class="bg-dark-800 rounded-2xl p-5 border border-white/5">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-white flex items-center gap-2">
        <span>🥧</span>
        Asset Allocation
      </h3>
    </div>
    
    <div v-if="portfolioStore.assetAllocation.length > 0" class="flex flex-col lg:flex-row items-center gap-6">
      <!-- Chart -->
      <div class="relative w-48 h-48">
        <Doughnut :data="chartData" :options="chartOptions" />
        <div class="absolute inset-0 flex flex-col items-center justify-center">
          <span class="text-2xl">📊</span>
          <span class="text-xs text-gray-400 mt-1">Portfolio</span>
        </div>
      </div>
      
      <!-- Legend -->
      <div class="flex-1 space-y-2">
        <div 
          v-for="item in portfolioStore.assetAllocation" 
          :key="item.type"
          class="flex items-center justify-between p-2 rounded-lg hover:bg-dark-700/50 transition-colors"
        >
          <div class="flex items-center gap-3">
            <div 
              class="w-3 h-3 rounded-full"
              :style="{ backgroundColor: item.color }"
            ></div>
            <span class="text-sm text-gray-300">{{ getAssetTypeName(item.type) }}</span>
          </div>
          <div class="text-right">
            <span class="text-sm font-medium text-white">{{ formatCurrency(item.value, true) }}</span>
            <span class="text-xs text-gray-500 ml-2">{{ item.percentage.toFixed(1) }}%</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Empty state -->
    <div v-else class="text-center py-8">
      <span class="text-4xl mb-3 block">📭</span>
      <p class="text-gray-400 mb-2">No assets yet</p>
      <p class="text-sm text-gray-500">Add your first investment to see allocation</p>
    </div>
  </div>
</template>
