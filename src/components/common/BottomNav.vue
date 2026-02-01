<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

interface NavItem {
  name: string;
  path: string;
  icon: string;
  activeIcon: string;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', path: '/', icon: '🏠', activeIcon: '🏠' },
  { name: 'Portfolio', path: '/portfolio', icon: '📊', activeIcon: '📊' },
  { name: 'Goals', path: '/goals', icon: '🎯', activeIcon: '🎯' },
  { name: 'Insights', path: '/insights', icon: '💡', activeIcon: '💡' },
  { name: 'Settings', path: '/settings', icon: '⚙️', activeIcon: '⚙️' }
];

function isActive(path: string): boolean {
  return route.path === path;
}

function navigateTo(path: string) {
  router.push(path);
}
</script>

<template>
  <nav class="fixed bottom-0 left-0 right-0 z-50 bg-dark-800/95 backdrop-blur-lg border-t border-white/10 safe-area-bottom">
    <div class="max-w-lg mx-auto px-2">
      <div class="flex items-center justify-around h-16">
        <button
          v-for="item in navItems"
          :key="item.path"
          @click="navigateTo(item.path)"
          class="flex flex-col items-center justify-center px-3 py-2 rounded-xl transition-all duration-300"
          :class="[
            isActive(item.path)
              ? 'text-primary-400 scale-110'
              : 'text-gray-400 hover:text-gray-200'
          ]"
        >
          <span 
            class="text-xl mb-1 transition-transform"
            :class="{ 'animate-pulse-slow': isActive(item.path) }"
          >
            {{ isActive(item.path) ? item.activeIcon : item.icon }}
          </span>
          <span 
            class="text-[10px] font-medium"
            :class="{ 'text-primary-400': isActive(item.path) }"
          >
            {{ item.name }}
          </span>
          
          <!-- Active indicator -->
          <div
            v-if="isActive(item.path)"
            class="absolute -top-1 w-8 h-1 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"
          ></div>
        </button>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
