<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useSettingsStore } from '@/stores/settings';
import { exportData, importData } from '@/services/db/indexedDb';
import { useNotifications } from '@/composables/useNotifications';

const settingsStore = useSettingsStore();
const { requestPermission, isSupported } = useNotifications();

const importFile = ref<HTMLInputElement | null>(null);
const importError = ref('');
const importSuccess = ref('');

onMounted(() => {
  settingsStore.loadSettings();
});

async function handleExport() {
  const data = await exportData();
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `dhan-rakshak-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function triggerImport() {
  importFile.value?.click();
}

async function handleImport(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  try {
    const text = await file.text();
    await importData(text);
    importSuccess.value = 'Data imported successfully! Reloading...';
    setTimeout(() => window.location.reload(), 1500);
  } catch (e) {
    importError.value = 'Failed to import data. Invalid format.';
    console.error(e);
  }
}

async function enableNotifications() {
  const granted = await requestPermission();
  if (granted) {
    settingsStore.updateSettings({ notifications: true });
  } else {
    alert('Notification permission denied. Please enable it in your browser settings.');
    settingsStore.updateSettings({ notifications: false });
  }
}
</script>

<template>
  <div class="space-y-6 animate-fade-in pb-20">
    <div class="flex items-center gap-3 mb-6">
      <h1 class="text-2xl font-bold text-white">Settings ⚙️</h1>
    </div>

    <!-- Appearance -->
    <section class="bg-dark-800 rounded-2xl p-6 border border-white/5">
      <h3 class="text-lg font-semibold text-white mb-4">Appearance</h3>
      
      <div class="flex items-center justify-between">
        <div>
          <p class="font-medium text-white">Dark Mode</p>
          <p class="text-sm text-gray-500">Easier on the eyes</p>
        </div>
        <button 
          @click="settingsStore.toggleDarkMode"
          class="relative w-12 h-6 rounded-full transition-colors duration-300"
          :class="settingsStore.settings.darkMode ? 'bg-primary-500' : 'bg-dark-700'"
        >
          <span 
            class="absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform duration-300"
            :class="{ 'translate-x-6': settingsStore.settings.darkMode }"
          ></span>
        </button>
      </div>
    </section>

    <!-- Preferences -->
    <section class="bg-dark-800 rounded-2xl p-6 border border-white/5">
      <h3 class="text-lg font-semibold text-white mb-4">Preferences</h3>
      
      <div class="space-y-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="font-medium text-white">Currency</p>
            <p class="text-sm text-gray-500">Display currency for all values</p>
          </div>
          <select 
            v-model="settingsStore.settings.currency"
            @change="settingsStore.updateSettings({ currency: settingsStore.settings.currency })"
            class="bg-dark-700 border border-white/10 text-white rounded-lg px-3 py-1 focus:outline-none focus:border-primary-500"
          >
            <option value="INR">INR (₹)</option>
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
          </select>
        </div>

        <div class="flex items-center justify-between">
          <div>
            <p class="font-medium text-white">Notifications</p>
            <p class="text-sm text-gray-500">Get reminders for bills and goals</p>
          </div>
          <button 
            @click="enableNotifications"
            :disabled="!isSupported"
            class="relative w-12 h-6 rounded-full transition-colors duration-300"
            :class="settingsStore.settings.notifications ? 'bg-primary-500' : 'bg-dark-700'"
          >
            <span 
              class="absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform duration-300"
              :class="{ 'translate-x-6': settingsStore.settings.notifications }"
            ></span>
          </button>
        </div>
      </div>
    </section>

    <!-- Goals & Budgets -->
    <section class="bg-dark-800 rounded-2xl p-6 border border-white/5">
      <h3 class="text-lg font-semibold text-white mb-4">Goals & Budgets</h3>
      
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">Monthly Budget Limit</label>
          <div class="relative">
            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
            <input
              v-model.lazy="settingsStore.settings.monthlyBudget"
              @change="settingsStore.setMonthlyBudget(settingsStore.settings.monthlyBudget)"
              type="number"
              class="w-full pl-8 pr-4 py-3 rounded-xl bg-dark-700 border border-white/10 text-white focus:border-primary-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">Savings Goal (%)</label>
          <div class="flex items-center gap-4">
             <input
              v-model.lazy="settingsStore.settings.savingsGoalPercentage"
              @change="settingsStore.setSavingsGoal(settingsStore.settings.savingsGoalPercentage)"
              type="range"
              min="0"
              max="100"
              class="flex-1 h-2 bg-dark-700 rounded-lg appearance-none cursor-pointer"
            />
            <span class="text-white font-medium w-12">{{ settingsStore.settings.savingsGoalPercentage }}%</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Data Management -->
    <section class="bg-dark-800 rounded-2xl p-6 border border-white/5">
      <h3 class="text-lg font-semibold text-white mb-4">Data Management</h3>
      
      <div class="flex gap-4">
        <button
          @click="handleExport"
          class="flex-1 py-3 rounded-xl bg-dark-700 text-white hover:bg-dark-600 transition-colors flex items-center justify-center gap-2"
        >
          <span>📥</span>
          Export Data
        </button>
        <button
          @click="triggerImport"
          class="flex-1 py-3 rounded-xl bg-dark-700 text-white hover:bg-dark-600 transition-colors flex items-center justify-center gap-2"
        >
          <span>📤</span>
          Import Data
        </button>
        <input
          ref="importFile"
          type="file"
          accept=".json"
          class="hidden"
          @change="handleImport"
        />
      </div>
      
      <p v-if="importError" class="text-red-400 text-sm mt-2 text-center">{{ importError }}</p>
      <p v-if="importSuccess" class="text-green-400 text-sm mt-2 text-center">{{ importSuccess }}</p>
    </section>

     <!-- About -->
    <section class="text-center py-6">
      <p class="text-sm text-gray-500">Dhan-Rakshak v1.0.0</p>
      <p class="text-xs text-gray-600 mt-1">Made with ❤️ for financial freedom</p>
    </section>
  </div>
</template>
