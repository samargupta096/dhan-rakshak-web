<script setup lang="ts">
import { ref } from 'vue';
import { usePortfolioStore } from '@/stores/portfolio';
import Modal from '@/components/common/Modal.vue';
import { parseUploadedCAS, CAS_INSTRUCTIONS } from '@/services/casParser';
import { 
  getCAMSSMSRequest, 
  getKFintechSMSRequest, 
  openSMSApp, 
  openCAMSWebsite, 
  openKFintechWebsite,
  getCASInstructions,
  isMobileDevice
} from '@/services/smsRequest';
import type { Asset } from '@/types';

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const show = defineModel<boolean>({ required: true });
const portfolioStore = usePortfolioStore();

const step = ref<'request' | 'upload' | 'preview'>('request');
const uploading = ref(false);
const error = ref('');
const parsedFunds = ref<any[]>([]);
const selectedFunds = ref<Set<string>>(new Set());
const pan = ref('');
const isMobile = isMobileDevice();
const instructions = getCASInstructions();

async function handleFileUpload(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  uploading.value = true;
  error.value = '';

  try {
    const result = await parseUploadedCAS(file);
    
    if (result.mutualFunds.length === 0) {
      error.value = 'No mutual funds found in the statement. Please check the file format.';
      return;
    }

    parsedFunds.value = result.mutualFunds;
    // Select all by default
    selectedFunds.value = new Set(result.mutualFunds.map((_, i) => i.toString()));
    step.value = 'preview';
  } catch (e) {
    console.error(e);
    error.value = 'Failed to parse CAS statement. Please ensure it\'s a valid CAMS/Karvy statement.';
  } finally {
    uploading.value = false;
  }
}

function toggleFund(index: number) {
  const key = index.toString();
  if (selectedFunds.value.has(key)) {
    selectedFunds.value.delete(key);
  } else {
    selectedFunds.value.add(key);
  }
}

async function importSelected() {
  uploading.value = true;
  
  try {
    for (const indexStr of selectedFunds.value) {
      const fund = parsedFunds.value[parseInt(indexStr)];
      
      const asset: Omit<Asset, 'id' | 'createdAt'> = {
        type: 'MUTUAL_FUND',
        name: fund.schemeName,
        symbol: fund.folioNumber, // Use folio as identifier
        quantity: fund.units,
        buyPrice: fund.costValue || fund.nav,
        currentPrice: fund.nav,
        updatedAt: Date.now()
      };
      
      await portfolioStore.addAsset(asset);
    }
    
    show.value = false;
    step.value = 'request';
  } catch (e) {
    error.value = 'Failed to import mutual funds';
    console.error(e);
  } finally {
    uploading.value = false;
  }
}

function requestViaCAMSSMS() {
  if (!pan.value || pan.value.length !== 10) {
    error.value = 'Please enter a valid 10-character PAN';
    return;
  }
  
  const request = getCAMSSMSRequest(pan.value);
  openSMSApp(request);
  error.value = '';
}

function requestViaKFintechSMS() {
  if (!pan.value || pan.value.length !== 10) {
    error.value = 'Please enter a valid 10-character PAN';
    return;
  }
  
  const request = getKFintechSMSRequest(pan.value);
  openSMSApp(request);
  error.value = '';
}

function openCAMS() {
  openCAMSWebsite();
}

function openKFintech() {
  openKFintechWebsite();
}
</script>

<template>
  <Modal v-model="show" title="Import Your Mutual Funds" size="lg">
    <!-- Request CAS Step -->
    <div v-if="step === 'request'" class="space-y-4">
      <div class="bg-primary-500/10 border border-primary-500/20 rounded-xl p-4">
        <h3 class="font-semibold text-primary-400 mb-2">{{ instructions.title }}</h3>
        <ol class="text-sm text-gray-300 space-y-1 list-decimal list-inside">
          <li v-for="(stepText, i) in instructions.steps" :key="i">{{ stepText }}</li>
        </ol>
      </div>

      <!-- Mobile: SMS Request -->
      <div v-if="isMobile" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">Enter Your PAN</label>
          <input
            v-model="pan"
            type="text"
            placeholder="ABCDE1234F"
            maxlength="10"
            class="w-full px-4 py-3 rounded-xl bg-dark-700 border border-white/10 text-white uppercase focus:border-primary-500 focus:outline-none"
          />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <button
            @click="requestViaCAMSSMS"
            class="p-4 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 transition-all"
          >
            <div class="text-2xl mb-1">📱</div>
            <div class="font-semibold text-sm">SMS to CAMS</div>
          </button>
          <button
            @click="requestViaKFintechSMS"
            class="p-4 rounded-xl bg-gradient-to-br from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 transition-all"
          >
            <div class="text-2xl mb-1">📱</div>
            <div class="font-semibold text-sm">SMS to KFintech</div>
          </button>
        </div>
      </div>

      <!-- Desktop: Web Links -->
      <div v-else class="grid grid-cols-2 gap-3">
        <button
          @click="openCAMS"
          class="p-4 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 transition-all"
        >
          <div class="text-2xl mb-1">🌐</div>
          <div class="font-semibold text-sm">Open CAMS Website</div>
        </button>
        <button
          @click="openKFintech"
          class="p-4 rounded-xl bg-gradient-to-br from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 transition-all"
        >
          <div class="text-2xl mb-1">🌐</div>
          <div class="font-semibold text-sm">Open KFintech Website</div>
        </button>
      </div>

      <p v-if="error" class="text-red-400 text-sm text-center">{{ error }}</p>

      <div class="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
        <p class="text-sm text-yellow-300">
          💡 <strong>Tip:</strong> After sending SMS/requesting online, you'll receive CAS via email within 30 minutes. Come back here to upload it!
        </p>
      </div>
    </div>

    <!-- Upload Step -->
    <div v-if="step === 'upload'" class="space-y-4">
      <div class="border-2 border-dashed border-white/20 rounded-xl p-8 text-center">
        <input
          type="file"
          accept=".txt,.pdf"
          @change="handleFileUpload"
          class="hidden"
          id="cas-upload"
        />
        <label for="cas-upload" class="cursor-pointer">
          <div class="text-6xl mb-4">📄</div>
          <p class="text-white font-medium mb-2">Click to upload CAS statement</p>
          <p class="text-sm text-gray-400">Supports .txt files from CAMS/KFintech</p>
        </label>
      </div>

      <p v-if="error" class="text-red-400 text-sm text-center">{{ error }}</p>
      <p v-if="uploading" class="text-primary-400 text-sm text-center">Parsing statement...</p>
    </div>

    <!-- Preview Step -->
    <div v-if="step === 'preview'" class="space-y-4">
      <div class="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
        <p class="text-green-400 font-medium">✅ Found {{ parsedFunds.length }} mutual fund(s)</p>
      </div>

      <div class="max-h-96 overflow-y-auto space-y-2">
        <div
          v-for="(fund, index) in parsedFunds"
          :key="index"
          @click="toggleFund(index)"
          class="p-4 rounded-xl border cursor-pointer transition-all"
          :class="selectedFunds.has(index.toString()) ? 'bg-primary-500/10 border-primary-500/30' : 'bg-dark-700 border-white/10'"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <p class="font-medium text-white">{{ fund.schemeName }}</p>
              <p class="text-sm text-gray-400 mt-1">{{ fund.amcName }}</p>
              <div class="flex gap-4 mt-2 text-xs text-gray-500">
                <span>Folio: {{ fund.folioNumber }}</span>
                <span>Units: {{ fund.units.toFixed(3) }}</span>
                <span>NAV: ₹{{ fund.nav.toFixed(2) }}</span>
              </div>
            </div>
            <div class="text-right">
              <p class="text-lg font-bold text-white">₹{{ fund.currentValue.toLocaleString('en-IN') }}</p>
              <input
                type="checkbox"
                :checked="selectedFunds.has(index.toString())"
                class="mt-2"
                @click.stop
              />
            </div>
          </div>
        </div>
      </div>

      <p class="text-sm text-gray-400 text-center">
        {{ selectedFunds.size }} of {{ parsedFunds.length }} selected
      </p>
    </div>

    <template #footer>
      <div v-if="step === 'request'" class="flex gap-3 w-full">
        <button
          @click="show = false"
          class="flex-1 py-3 rounded-xl bg-dark-700 text-white hover:bg-dark-600"
        >
          Cancel
        </button>
        <button
          @click="step = 'upload'"
          class="flex-1 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold"
        >
          I Have My CAS →
        </button>
      </div>

      <div v-if="step === 'upload'" class="flex gap-3 w-full">
        <button
          @click="step = 'request'"
          class="flex-1 py-3 rounded-xl bg-dark-700 text-white hover:bg-dark-600"
        >
          ← Back
        </button>
      </div>

      <div v-if="step === 'preview'" class="flex gap-3 w-full">
        <button
          @click="step = 'upload'"
          class="flex-1 py-3 rounded-xl bg-dark-700 text-white hover:bg-dark-600"
        >
          Upload Different File
        </button>
        <button
          @click="importSelected"
          :disabled="selectedFunds.size === 0 || uploading"
          class="flex-1 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold disabled:opacity-50"
        >
          {{ uploading ? 'Importing...' : `Import ${selectedFunds.size} Fund(s)` }}
        </button>
      </div>
    </template>
  </Modal>
</template>

