<script setup lang="ts">
import { computed } from 'vue';
import { useSyncStore } from '@/stores/sync';
import { useAuthStore } from '@/stores/auth';

const syncStore = useSyncStore();
const authStore = useAuthStore();

const lastSyncText = computed(() => {
  if (!syncStore.lastSyncTime) return 'Never';
  
  const now = Date.now();
  const diff = now - syncStore.lastSyncTime;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
});

async function handleUpload() {
  try {
    await syncStore.uploadToCloud();
  } catch (e) {
    console.error('Upload failed:', e);
  }
}

async function handleDownload() {
  if (confirm('This will replace all local data with cloud data. Continue?')) {
    try {
      await syncStore.downloadFromCloud();
    } catch (e) {
      console.error('Download failed:', e);
    }
  }
}
</script>

<template>
  <div v-if="authStore.isAuthenticated" class="fixed bottom-20 right-4 z-40">
    <div class="bg-dark-800 rounded-xl border border-white/10 p-4 shadow-xl min-w-[200px]">
      <!-- Sync Status -->
      <div class="flex items-center gap-2 mb-3">
        <div 
          class="w-2 h-2 rounded-full"
          :class="syncStore.syncing ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'"
        ></div>
        <span class="text-xs text-gray-400">
          {{ syncStore.syncing ? 'Syncing...' : 'Synced' }}
        </span>
      </div>

      <!-- Last Sync Time -->
      <p class="text-xs text-gray-500 mb-3">
        Last sync: {{ lastSyncText }}
      </p>

      <!-- Sync Buttons -->
      <div class="space-y-2">
        <button
          @click="handleUpload"
          :disabled="syncStore.syncing"
          class="w-full px-3 py-2 rounded-lg bg-primary-500 text-white text-sm hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <span>☁️</span>
          {{ syncStore.syncing ? 'Uploading...' : 'Upload to Cloud' }}
        </button>
        
        <button
          @click="handleDownload"
          :disabled="syncStore.syncing"
          class="w-full px-3 py-2 rounded-lg bg-dark-700 text-white text-sm hover:bg-dark-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <span>📥</span>
          Download from Cloud
        </button>
      </div>

      <!-- Error -->
      <p v-if="syncStore.error" class="text-xs text-red-400 mt-2">
        {{ syncStore.error }}
      </p>
    </div>
  </div>
</template>
