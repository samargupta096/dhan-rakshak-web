<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useSettingsStore } from '@/stores/settings';
import { useAuthStore } from '@/stores/auth';

const route = useRoute();
const settingsStore = useSettingsStore();
const authStore = useAuthStore();

const pageTitle = computed(() => route.meta.title as string || 'Dhan-Rakshak');

function toggleDarkMode() {
  settingsStore.toggleDarkMode();
}
</script>

<template>
  <header class="sticky top-0 z-50 bg-dark-800/95 backdrop-blur-sm border-b border-white/10">
    <div class="max-w-7xl mx-auto px-4 py-4">
      <div class="flex items-center justify-between">
        <!-- Logo & Title -->
        <div class="flex items-center gap-3">
          <div class="text-2xl">💰</div>
          <div>
            <h1 class="text-xl font-bold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
              Dhan-Rakshak
            </h1>
            <p class="text-xs text-gray-500">{{ pageTitle }}</p>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-3">
          <!-- Dark Mode Toggle -->
          <button
            @click="toggleDarkMode"
            class="p-2 rounded-lg hover:bg-dark-700 transition-colors"
            :class="settingsStore.settings.darkMode ? 'text-yellow-400' : 'text-gray-400'"
          >
            {{ settingsStore.settings.darkMode ? '🌙' : '☀️' }}
          </button>

          <!-- User Profile -->
          <div v-if="authStore.isAuthenticated" class="flex items-center gap-2">
            <div class="hidden sm:block text-right">
              <p class="text-sm font-medium text-white">{{ authStore.displayName }}</p>
              <p class="text-xs text-gray-500">{{ authStore.email }}</p>
            </div>
            <div class="relative group">
              <img
                v-if="authStore.photoURL"
                :src="authStore.photoURL"
                :alt="authStore.displayName"
                class="w-10 h-10 rounded-full border-2 border-primary-500 cursor-pointer"
              />
              <div
                v-else
                class="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold cursor-pointer"
              >
                {{ authStore.displayName?.[0]?.toUpperCase() || 'U' }}
              </div>
              
              <!-- Dropdown -->
              <div class="absolute right-0 mt-2 w-48 bg-dark-800 rounded-xl border border-white/10 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <router-link
                  to="/settings"
                  class="block px-4 py-3 text-sm text-gray-300 hover:bg-dark-700 rounded-t-xl"
                >
                  ⚙️ Settings
                </router-link>
                <button
                  @click="authStore.logout"
                  class="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-dark-700 rounded-b-xl"
                >
                  🚪 Logout
                </button>
              </div>
            </div>
          </div>

          <!-- Login Button (if not authenticated) -->
          <router-link
            v-else
            to="/login"
            class="px-4 py-2 rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors text-sm font-medium"
          >
            Login
          </router-link>
        </div>
      </div>
    </div>
  </header>
</template>
