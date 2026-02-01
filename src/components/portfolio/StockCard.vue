<script setup lang="ts">
import { computed } from 'vue';
import type { Asset } from '@/types';
import { formatCurrency, formatPercentage } from '@/utils/formatters';

const props = defineProps<{
  asset: Asset;
}>();

const emit = defineEmits<{
  edit: [asset: Asset];
  delete: [id: number];
}>();

const currentValue = computed(() => props.asset.quantity * props.asset.currentPrice);
const investedValue = computed(() => props.asset.quantity * props.asset.buyPrice);
const gain = computed(() => currentValue.value - investedValue.value);
const gainPercentage = computed(() => 
  investedValue.value > 0 ? (gain.value / investedValue.value) * 100 : 0
);
const isPositive = computed(() => gain.value >= 0);
</script>

<template>
  <div class="bg-dark-700/50 rounded-xl p-4 border border-white/5 hover:border-primary-500/30 transition-all group">
    <div class="flex items-start justify-between">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center text-2xl">
          📈
        </div>
        <div>
          <h4 class="font-semibold text-white group-hover:text-primary-300 transition-colors">
            {{ asset.name }}
          </h4>
          <p class="text-sm text-gray-500">
            {{ asset.symbol || 'STOCK' }} • {{ asset.quantity }} units
          </p>
        </div>
      </div>
      
      <div class="flex gap-1">
        <button 
          @click.stop="emit('edit', asset)"
          class="p-2 rounded-lg hover:bg-dark-600 text-gray-400 hover:text-white transition-colors"
          title="Edit"
        >
          ✏️
        </button>
        <button 
          @click.stop="emit('delete', asset.id!)"
          class="p-2 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
          title="Delete"
        >
          🗑️
        </button>
      </div>
    </div>
    
    <div class="mt-4 grid grid-cols-2 gap-4">
      <div>
        <p class="text-xs text-gray-500 mb-1">Current Value</p>
        <p class="text-lg font-bold text-white">{{ formatCurrency(currentValue) }}</p>
      </div>
      <div>
        <p class="text-xs text-gray-500 mb-1">Gain/Loss</p>
        <p 
          class="text-lg font-bold"
          :class="isPositive ? 'text-green-400' : 'text-red-400'"
        >
          {{ formatCurrency(gain) }}
          <span class="text-sm font-normal">({{ formatPercentage(gainPercentage) }})</span>
        </p>
      </div>
    </div>
    
    <div class="mt-3 pt-3 border-t border-white/5 flex justify-between text-sm">
      <div>
        <span class="text-gray-500">Buy: </span>
        <span class="text-gray-300">{{ formatCurrency(asset.buyPrice) }}</span>
      </div>
      <div>
        <span class="text-gray-500">Current: </span>
        <span class="text-gray-300">{{ formatCurrency(asset.currentPrice) }}</span>
      </div>
    </div>
  </div>
</template>
