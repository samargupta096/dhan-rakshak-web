<script setup lang="ts">
import { ref, watch } from 'vue';
import Modal from '@/components/common/Modal.vue';
import { usePortfolioStore } from '@/stores/portfolio';
import type { Asset, AssetType } from '@/types';

const props = defineProps<{
  modelValue: boolean;
  asset: Asset | null;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
}>();

const portfolioStore = usePortfolioStore();

const assetTypes: { value: AssetType; label: string; icon: string }[] = [
  { value: 'STOCK', label: 'Stocks', icon: '📈' },
  { value: 'MUTUAL_FUND', label: 'Mutual Funds', icon: '📊' },
  { value: 'GOLD', label: 'Gold', icon: '🥇' },
  { value: 'FD', label: 'Fixed Deposit', icon: '🏦' },
  { value: 'RD', label: 'Recurring Deposit', icon: '💳' },
  { value: 'PPF', label: 'PPF', icon: '🏛️' },
  { value: 'EPF', label: 'EPF', icon: '👷' },
  { value: 'CRYPTO', label: 'Cryptocurrency', icon: '₿' },
  { value: 'BANK_ACCOUNT', label: 'Bank Account', icon: '💰' }
];

const form = ref({
  name: '',
  symbol: '',
  type: 'STOCK' as AssetType,
  quantity: 0,
  buyPrice: 0,
  currentPrice: 0
});

const loading = ref(false);
const error = ref('');

// Watch for asset changes and populate form
watch(() => props.asset, (newAsset) => {
  if (newAsset) {
    form.value = {
      name: newAsset.name,
      symbol: newAsset.symbol || '',
      type: newAsset.type,
      quantity: newAsset.quantity,
      buyPrice: newAsset.buyPrice,
      currentPrice: newAsset.currentPrice
    };
  }
}, { immediate: true });

async function handleSubmit() {
  if (!props.asset?.id) return;
  
  loading.value = true;
  error.value = '';
  
  try {
    await portfolioStore.updateAsset(props.asset.id, {
      name: form.value.name,
      symbol: form.value.symbol || undefined,
      type: form.value.type,
      quantity: form.value.quantity,
      buyPrice: form.value.buyPrice,
      currentPrice: form.value.currentPrice
    });
    
    emit('update:modelValue', false);
  } catch (e) {
    error.value = 'Failed to update asset. Please try again.';
  } finally {
    loading.value = false;
  }
}

function close() {
  emit('update:modelValue', false);
}
</script>

<template>
  <Modal :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)" title="Edit Asset" size="lg">
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <!-- Asset Type -->
      <div>
        <label class="block text-sm font-medium text-gray-300 mb-2">Asset Type</label>
        <div class="grid grid-cols-3 gap-2">
          <button
            v-for="assetType in assetTypes"
            :key="assetType.value"
            type="button"
            @click="form.type = assetType.value"
            class="p-3 rounded-xl border text-center transition-all"
            :class="[
              form.type === assetType.value
                ? 'border-primary-500 bg-primary-500/20 text-white'
                : 'border-white/10 bg-dark-700 text-gray-400 hover:border-white/20'
            ]"
          >
            <span class="text-xl block mb-1">{{ assetType.icon }}</span>
            <span class="text-xs">{{ assetType.label }}</span>
          </button>
        </div>
      </div>

      <!-- Name -->
      <div>
        <label class="block text-sm font-medium text-gray-300 mb-2">Name *</label>
        <input
          v-model="form.name"
          type="text"
          placeholder="e.g., Reliance Industries"
          class="w-full px-4 py-3 rounded-xl bg-dark-700 border border-white/10 text-white placeholder-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 transition-colors"
          required
        />
      </div>

      <!-- Symbol (optional) -->
      <div>
        <label class="block text-sm font-medium text-gray-300 mb-2">Symbol (optional)</label>
        <input
          v-model="form.symbol"
          type="text"
          placeholder="e.g., RELIANCE"
          class="w-full px-4 py-3 rounded-xl bg-dark-700 border border-white/10 text-white placeholder-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 transition-colors"
        />
      </div>

      <!-- Quantity & Prices -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">Quantity *</label>
          <input
            v-model.number="form.quantity"
            type="number"
            step="any"
            min="0"
            placeholder="0"
            class="w-full px-4 py-3 rounded-xl bg-dark-700 border border-white/10 text-white placeholder-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 transition-colors"
            required
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">Buy Price (₹) *</label>
          <input
            v-model.number="form.buyPrice"
            type="number"
            step="any"
            min="0"
            placeholder="0"
            class="w-full px-4 py-3 rounded-xl bg-dark-700 border border-white/10 text-white placeholder-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 transition-colors"
            required
          />
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-300 mb-2">Current Price (₹)</label>
        <input
          v-model.number="form.currentPrice"
          type="number"
          step="any"
          min="0"
          placeholder="0"
          class="w-full px-4 py-3 rounded-xl bg-dark-700 border border-white/10 text-white placeholder-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 transition-colors"
        />
      </div>

      <!-- Error -->
      <div v-if="error" class="p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 text-sm">
        {{ error }}
      </div>
    </form>

    <template #footer>
      <div class="flex gap-3">
        <button
          @click="close"
          class="flex-1 px-4 py-3 rounded-xl bg-dark-700 text-gray-300 font-medium hover:bg-dark-600 transition-colors"
        >
          Cancel
        </button>
        <button
          @click="handleSubmit"
          :disabled="!form.name || form.quantity <= 0 || form.buyPrice <= 0 || loading"
          class="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 text-white font-medium hover:from-primary-600 hover:to-accent-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ loading ? 'Saving...' : 'Save Changes' }}
        </button>
      </div>
    </template>
  </Modal>
</template>
