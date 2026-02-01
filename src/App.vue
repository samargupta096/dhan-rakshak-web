<script setup lang="ts">
import { onMounted } from 'vue';
import { AppHeader, BottomNav } from '@/components/common';
import CloudSyncWidget from '@/components/common/CloudSyncWidget.vue';
import { useSettingsStore } from '@/stores/settings';

const settingsStore = useSettingsStore();

onMounted(() => {
  // Apply dark mode class to html element
  document.documentElement.classList.toggle('dark', settingsStore.settings.darkMode);
});
</script>

<template>
  <div class="min-h-screen bg-dark-900 text-white font-sans antialiased selection:bg-primary-500/30 selection:text-primary-200">
    <AppHeader />
    
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    
    <BottomNav />
    <CloudSyncWidget />
  </div>
</template>

<style>
/* Page Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Scrollbar Styling */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #0f0f23; 
}

::-webkit-scrollbar-thumb {
  background: #374151; 
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #4b5563; 
}

/* Font Setup */
body {
  font-family: 'Inter', sans-serif;
  background-color: #0f0f23;
}
</style>
