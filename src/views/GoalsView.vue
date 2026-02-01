<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useGoalsStore } from '@/stores/goals';
import Modal from '@/components/common/Modal.vue';
import { formatCurrency, formatDate } from '@/utils/formatters';

const goalsStore = useGoalsStore();

const showAddModal = ref(false);

const form = ref({
  name: '',
  targetAmount: 0,
  currentAmount: 0,
  targetDate: '',
  category: 'SAVINGS',
  icon: '🎯',
  color: '#8b5cf6'
});

const goalCategories = [
  { value: 'SAVINGS', label: 'Savings', icon: '💰' },
  { value: 'EMERGENCY', label: 'Emergency Fund', icon: '🆘' },
  { value: 'TRAVEL', label: 'Travel', icon: '✈️' },
  { value: 'CAR', label: 'Car', icon: '🚗' },
  { value: 'HOME', label: 'Home', icon: '🏠' },
  { value: 'EDUCATION', label: 'Education', icon: '📚' },
  { value: 'RETIREMENT', label: 'Retirement', icon: '👴' },
  { value: 'WEDDING', label: 'Wedding', icon: '💒' },
  { value: 'OTHER', label: 'Other', icon: '🎯' }
];

onMounted(() => {
  goalsStore.loadGoals();
});

function getProgress(current: number, target: number): number {
  return target > 0 ? (current / target) * 100 : 0;
}

async function handleSubmit() {
  if (!form.value.name || form.value.targetAmount <= 0) return;
  
  const category = goalCategories.find(c => c.value === form.value.category);
  
  await goalsStore.addGoal({
    name: form.value.name,
    targetAmount: form.value.targetAmount,
    currentAmount: form.value.currentAmount,
    targetDate: new Date(form.value.targetDate).getTime(),
    category: form.value.category,
    icon: category?.icon || '🎯',
    color: form.value.color
  });
  
  form.value = {
    name: '',
    targetAmount: 0,
    currentAmount: 0,
    targetDate: '',
    category: 'SAVINGS',
    icon: '🎯',
    color: '#8b5cf6'
  };
  
  showAddModal.value = false;
}

async function handleDelete(id: number) {
  if (confirm('Delete this goal?')) {
    await goalsStore.deleteGoal(id);
  }
}

async function handleAddToGoal(id: number) {
  const amount = prompt('Enter amount to add:');
  if (amount && !isNaN(Number(amount))) {
    await goalsStore.addToGoal(id, Number(amount));
  }
}
</script>

<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-white">Financial Goals 🎯</h1>
        <p class="text-gray-400 mt-1">Track your savings targets</p>
      </div>
      <button
        @click="showAddModal = true"
        class="px-6 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold hover:from-primary-600 hover:to-accent-600 transition-all shadow-lg shadow-primary-500/25 flex items-center gap-2"
      >
        <span>➕</span>
        New Goal
      </button>
    </div>

    <!-- Overall Progress -->
    <div class="bg-gradient-to-r from-primary-600/20 to-accent-600/20 rounded-2xl p-6 border border-primary-500/20">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-white">Overall Progress</h3>
        <span class="text-2xl font-bold text-primary-400">{{ goalsStore.overallProgress.toFixed(0) }}%</span>
      </div>
      <div class="h-3 bg-dark-700 rounded-full overflow-hidden">
        <div 
          class="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all duration-500"
          :style="{ width: `${Math.min(goalsStore.overallProgress, 100)}%` }"
        ></div>
      </div>
      <div class="flex justify-between mt-3 text-sm">
        <span class="text-gray-400">Saved: {{ formatCurrency(goalsStore.totalCurrentAmount, true) }}</span>
        <span class="text-gray-400">Target: {{ formatCurrency(goalsStore.totalTargetAmount, true) }}</span>
      </div>
    </div>

    <!-- Goals Grid -->
    <div v-if="goalsStore.goals.length > 0" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div 
        v-for="goal in goalsStore.goals" 
        :key="goal.id"
        class="bg-dark-800 rounded-xl p-5 border border-white/5 hover:border-primary-500/30 transition-all group"
      >
        <div class="flex items-start justify-between mb-4">
          <div class="flex items-center gap-3">
            <div 
              class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
              :style="{ backgroundColor: `${goal.color}20` }"
            >
              {{ goal.icon || '🎯' }}
            </div>
            <div>
              <h4 class="font-semibold text-white">{{ goal.name }}</h4>
              <p class="text-xs text-gray-500">{{ goal.category }}</p>
            </div>
          </div>
          <button 
            @click="handleDelete(goal.id!)"
            class="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-all"
          >
            🗑️
          </button>
        </div>

        <div class="space-y-3">
          <div class="flex justify-between text-sm">
            <span class="text-gray-400">Progress</span>
            <span class="font-semibold text-white">{{ getProgress(goal.currentAmount, goal.targetAmount).toFixed(0) }}%</span>
          </div>
          
          <div class="h-2 bg-dark-700 rounded-full overflow-hidden">
            <div 
              class="h-full rounded-full transition-all duration-500"
              :style="{ 
                width: `${Math.min(getProgress(goal.currentAmount, goal.targetAmount), 100)}%`,
                backgroundColor: goal.color || '#8b5cf6'
              }"
            ></div>
          </div>

          <div class="flex justify-between text-sm">
            <span class="text-gray-400">{{ formatCurrency(goal.currentAmount, true) }}</span>
            <span class="text-gray-400">{{ formatCurrency(goal.targetAmount, true) }}</span>
          </div>

          <div class="pt-3 border-t border-white/5 flex justify-between items-center">
            <span class="text-xs text-gray-500">📅 {{ formatDate(goal.targetDate) }}</span>
            <button
              @click="handleAddToGoal(goal.id!)"
              class="px-3 py-1 rounded-lg bg-primary-500/20 text-primary-400 text-sm font-medium hover:bg-primary-500/30 transition-colors"
            >
              + Add
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-16">
      <span class="text-6xl mb-4 block">🎯</span>
      <h3 class="text-xl font-semibold text-white mb-2">No goals yet</h3>
      <p class="text-gray-400 mb-6">Set your first financial goal</p>
      <button
        @click="showAddModal = true"
        class="px-6 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold"
      >
        Create First Goal
      </button>
    </div>

    <!-- Add Goal Modal -->
    <Modal v-model="showAddModal" title="Create New Goal" size="md">
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">Goal Name</label>
          <input
            v-model="form.name"
            type="text"
            class="w-full px-4 py-3 rounded-xl bg-dark-700 border border-white/10 text-white focus:border-primary-500 focus:outline-none"
            placeholder="e.g., Emergency Fund"
            required
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">Category</label>
          <div class="grid grid-cols-3 gap-2">
            <button
              v-for="cat in goalCategories"
              :key="cat.value"
              type="button"
              @click="form.category = cat.value"
              class="p-3 rounded-xl text-center transition-all"
              :class="form.category === cat.value ? 'bg-primary-500 text-white' : 'bg-dark-700 text-gray-400 hover:bg-dark-600'"
            >
              <span class="text-xl block">{{ cat.icon }}</span>
              <span class="text-xs">{{ cat.label }}</span>
            </button>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Target Amount (₹)</label>
            <input
              v-model.number="form.targetAmount"
              type="number"
              min="0"
              class="w-full px-4 py-3 rounded-xl bg-dark-700 border border-white/10 text-white focus:border-primary-500 focus:outline-none"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Current Saved (₹)</label>
            <input
              v-model.number="form.currentAmount"
              type="number"
              min="0"
              class="w-full px-4 py-3 rounded-xl bg-dark-700 border border-white/10 text-white focus:border-primary-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">Target Date</label>
          <input
            v-model="form.targetDate"
            type="date"
            class="w-full px-4 py-3 rounded-xl bg-dark-700 border border-white/10 text-white focus:border-primary-500 focus:outline-none"
            required
          />
        </div>
      </form>

      <template #footer>
        <button
          @click="handleSubmit"
          :disabled="!form.name || form.targetAmount <= 0"
          class="w-full py-3 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold disabled:opacity-50"
        >
          Create Goal
        </button>
      </template>
    </Modal>
  </div>
</template>
