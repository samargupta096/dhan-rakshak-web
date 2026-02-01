<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { usePortfolioStore } from '@/stores/portfolio';
import { StockCard, MutualFundCard, AddAssetModal } from '@/components/portfolio';
import ImportMFModal from '@/components/portfolio/ImportMFModal.vue';
import FetchPortfolioModal from '@/components/portfolio/FetchPortfolioModal.vue';
import EditAssetModal from '@/components/portfolio/EditAssetModal.vue';
import DeleteConfirmationModal from '@/components/common/DeleteConfirmationModal.vue';
import { formatCurrency, formatPercentage, getAssetTypeName } from '@/utils/formatters';
import type { Asset, AssetType } from '@/types';

const portfolioStore = usePortfolioStore();

const showAddModal = ref(false);
const showImportMFModal = ref(false);
const showFetchModal = ref(false);
const showEditModal = ref(false);
const showDeleteModal = ref(false);
const editingAsset = ref<Asset | null>(null);
const assetToDeleteId = ref<number | null>(null);
const assetToDeleteName = ref<string>('');
const activeFilter = ref<AssetType | 'ALL'>('ALL');

const assetFilters: { value: AssetType | 'ALL'; label: string; icon: string }[] = [
  { value: 'ALL', label: 'All', icon: '📋' },
  { value: 'STOCK', label: 'Stocks', icon: '📈' },
  { value: 'MUTUAL_FUND', label: 'MF', icon: '📊' },
  { value: 'GOLD', label: 'Gold', icon: '🥇' },
  { value: 'CRYPTO', label: 'Crypto', icon: '₿' },
  { value: 'FD', label: 'FD', icon: '🏦' }
];

const filteredAssets = computed(() => {
  if (activeFilter.value === 'ALL') {
    return portfolioStore.assets;
  }
  return portfolioStore.assets.filter(a => a.type === activeFilter.value);
});

onMounted(() => {
  portfolioStore.loadAssets();
});

function handleEdit(asset: Asset) {
  editingAsset.value = asset;
  showEditModal.value = true;
}

function handleDelete(id: number) {
  const asset = portfolioStore.assets.find(a => a.id === id);
  if (asset) {
    assetToDeleteId.value = id;
    assetToDeleteName.value = asset.name;
    showDeleteModal.value = true;
  }
}

async function confirmDelete() {
  if (assetToDeleteId.value) {
    await portfolioStore.deleteAsset(assetToDeleteId.value);
    assetToDeleteId.value = null;
  }
}
</script>

<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-white">Portfolio 📊</h1>
        <p class="text-gray-400 mt-1">Manage your investments</p>
      </div>
      <div class="flex gap-2 flex-wrap">
        <button
          @click="portfolioStore.refreshAllPrices"
          :disabled="portfolioStore.refreshing || portfolioStore.assets.length === 0"
          class="px-4 py-3 rounded-xl bg-dark-700 text-white font-medium hover:bg-dark-600 transition-all border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <span :class="{ 'animate-spin': portfolioStore.refreshing }">🔄</span>
          {{ portfolioStore.refreshing ? 'Updating...' : 'Refresh Prices' }}
        </button>
        <button
          @click="showFetchModal = true"
          class="px-4 py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium hover:from-green-700 hover:to-emerald-700 transition-all flex items-center gap-2"
        >
          <span>📲</span>
          Fetch via OTP
        </button>
        <button
          @click="showImportMFModal = true"
          class="px-4 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-all flex items-center gap-2"
        >
          <span>📥</span>
          Import MF
        </button>
        <button
          @click="showAddModal = true"
          class="px-6 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold hover:from-primary-600 hover:to-accent-600 transition-all shadow-lg shadow-primary-500/25 flex items-center gap-2"
        >
          <span>➕</span>
          Add Asset
        </button>
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="grid sm:grid-cols-3 gap-4">
      <div class="bg-dark-800 rounded-xl p-5 border border-white/5">
        <p class="text-sm text-gray-500 mb-1">Total Investment</p>
        <p class="text-2xl font-bold text-white">{{ formatCurrency(portfolioStore.totalInvested, true) }}</p>
      </div>
      <div class="bg-dark-800 rounded-xl p-5 border border-white/5">
        <p class="text-sm text-gray-500 mb-1">Current Value</p>
        <p class="text-2xl font-bold text-white">{{ formatCurrency(portfolioStore.netWorth, true) }}</p>
      </div>
      <div class="bg-dark-800 rounded-xl p-5 border border-white/5">
        <p class="text-sm text-gray-500 mb-1">Total Returns</p>
        <p 
          class="text-2xl font-bold"
          :class="portfolioStore.totalGain >= 0 ? 'text-green-400' : 'text-red-400'"
        >
          {{ formatCurrency(portfolioStore.totalGain, true) }}
          <span class="text-sm font-normal">({{ formatPercentage(portfolioStore.gainPercentage) }})</span>
        </p>
      </div>
    </div>

    <!-- Filters -->
    <div class="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      <button
        v-for="filter in assetFilters"
        :key="filter.value"
        @click="activeFilter = filter.value"
        class="px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2"
        :class="[
          activeFilter === filter.value
            ? 'bg-primary-500 text-white'
            : 'bg-dark-700 text-gray-400 hover:bg-dark-600 hover:text-white'
        ]"
      >
        <span>{{ filter.icon }}</span>
        {{ filter.label }}
      </button>
    </div>

    <!-- Assets Grid -->
    <div v-if="filteredAssets.length > 0" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <template v-for="asset in filteredAssets" :key="asset.id">
        <StockCard 
          v-if="asset.type === 'STOCK'" 
          :asset="asset" 
          @edit="handleEdit"
          @delete="handleDelete"
        />
        <MutualFundCard 
          v-else-if="asset.type === 'MUTUAL_FUND'" 
          :asset="asset"
          @edit="handleEdit"
          @delete="handleDelete"
        />
        <StockCard 
          v-else 
          :asset="asset"
          @edit="handleEdit"
          @delete="handleDelete"
        />
      </template>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-16">
      <span class="text-6xl mb-4 block">📭</span>
      <h3 class="text-xl font-semibold text-white mb-2">No assets yet</h3>
      <p class="text-gray-400 mb-6">Start building your portfolio by adding your first investment</p>
      <button
        @click="showAddModal = true"
        class="px-6 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold hover:from-primary-600 hover:to-accent-600 transition-all"
      >
        Add Your First Asset
      </button>
    </div>

    <!-- Add Asset Modal -->
    <AddAssetModal v-model="showAddModal" />
    
    <!-- ImportMutual Funds Modal -->
    <ImportMFModal v-model="showImportMFModal" />
    
    <!-- Fetch Portfolio via OTP Modal -->
    <FetchPortfolioModal v-model="showFetchModal" />
    
    <!-- Edit Asset Modal -->
    <EditAssetModal v-model="showEditModal" :asset="editingAsset" />

    <!-- Delete Confirmation Modal -->
    <DeleteConfirmationModal 
      v-model="showDeleteModal" 
      :item-name="assetToDeleteName"
      @confirm="confirmDelete"
    />
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
