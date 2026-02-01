<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRemindersStore } from '@/stores/reminders';
import Modal from '@/components/common/Modal.vue';
import { formatCurrency, formatDate } from '@/utils/formatters';
import type { ReminderFrequency } from '@/types';

const remindersStore = useRemindersStore();
const showAddModal = ref(false);

const form = ref({
  title: '',
  category: 'BILL',
  amount: 0,
  reminderTime: '',
  frequency: 'MONTHLY' as ReminderFrequency,
  isEnabled: true
});

const frequencies: { value: ReminderFrequency; label: string }[] = [
  { value: 'ONCE', label: 'One Time' },
  { value: 'DAILY', label: 'Daily' },
  { value: 'WEEKLY', label: 'Weekly' },
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'YEARLY', label: 'Yearly' }
];

const categories = [
  { value: 'BILL', label: 'Bill Payment', icon: '📄' },
  { value: 'SIP', label: 'SIP/Investment', icon: '📈' },
  { value: 'EMI', label: 'Loan EMI', icon: '🏦' },
  { value: 'SUBSCRIPTION', label: 'Subscription', icon: '📺' },
  { value: 'OTHER', label: 'Other', icon: '⏰' }
];

onMounted(() => {
  remindersStore.loadReminders();
});

async function handleSubmit() {
  if (!form.value.title || !form.value.reminderTime) return;
  
  await remindersStore.addReminder({
    title: form.value.title,
    category: form.value.category,
    amount: form.value.amount > 0 ? form.value.amount : undefined,
    reminderTime: new Date(form.value.reminderTime).getTime(),
    frequency: form.value.frequency,
    isEnabled: form.value.isEnabled
  });
  
  form.value = {
    title: '',
    category: 'BILL',
    amount: 0,
    reminderTime: '',
    frequency: 'MONTHLY',
    isEnabled: true
  };
  
  showAddModal.value = false;
}

async function handleDelete(id: number) {
  if (confirm('Delete this reminder?')) {
    await remindersStore.deleteReminder(id);
  }
}

async function handleToggle(id: number) {
  await remindersStore.toggleReminder(id);
}
</script>

<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-white">Reminders ⏰</h1>
        <p class="text-gray-400 mt-1">Never miss a bill payment</p>
      </div>
      <button
        @click="showAddModal = true"
        class="px-6 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold hover:from-primary-600 hover:to-accent-600 transition-all shadow-lg shadow-primary-500/25 flex items-center gap-2"
      >
        <span>➕</span>
        Add Reminder
      </button>
    </div>

    <!-- Monthly Stats -->
    <div class="bg-dark-800 rounded-xl p-5 border border-white/5 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
          📅
        </div>
        <div>
          <p class="text-sm text-gray-500">Monthly Commitments</p>
          <p class="text-xl font-bold text-white">{{ formatCurrency(remindersStore.totalMonthlyBills, true) }}</p>
        </div>
      </div>
      <div class="text-right">
        <p class="text-lg font-bold text-white">{{ remindersStore.activeReminders.length }}</p>
        <p class="text-xs text-gray-500">Active</p>
      </div>
    </div>

    <!-- Reminders List -->
    <div v-if="remindersStore.reminders.length > 0" class="space-y-3">
      <div 
        v-for="reminder in remindersStore.reminders" 
        :key="reminder.id"
        class="flex items-center justify-between p-4 rounded-xl bg-dark-800 border transition-all group"
        :class="[
          reminder.isEnabled ? 'border-white/5 hover:border-primary-500/30' : 'border-white/5 opacity-60'
        ]"
      >
        <div class="flex items-center gap-4">
          <div 
            class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
            :class="reminder.isEnabled ? 'bg-primary-500/20' : 'bg-dark-700'"
          >
            {{ categories.find(c => c.value === reminder.category)?.icon || '⏰' }}
          </div>
          <div>
            <h4 
              class="font-semibold"
              :class="reminder.isEnabled ? 'text-white' : 'text-gray-500'"
            >
              {{ reminder.title }}
            </h4>
            <div class="flex items-center gap-2 text-xs text-gray-500">
              <span class="px-2 py-0.5 rounded-full bg-dark-700">{{ reminder.frequency }}</span>
              <span>Next: {{ formatDate(reminder.reminderTime, 'long') }}</span>
            </div>
          </div>
        </div>
        
        <div class="flex items-center gap-4">
          <p v-if="reminder.amount" class="text-lg font-bold text-white hidden sm:block">
            {{ formatCurrency(reminder.amount) }}
          </p>
          
          <div class="flex items-center gap-2">
            <!-- Toggle Switch -->
            <button 
              @click="handleToggle(reminder.id!)"
              class="relative w-12 h-6 rounded-full transition-colors duration-300"
              :class="reminder.isEnabled ? 'bg-primary-500' : 'bg-dark-700'"
            >
              <span 
                class="absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform duration-300"
                :class="{ 'translate-x-6': reminder.isEnabled }"
              ></span>
            </button>
            
            <button 
              @click="handleDelete(reminder.id!)"
              class="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-all"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-16">
      <span class="text-6xl mb-4 block">⏰</span>
      <h3 class="text-xl font-semibold text-white mb-2">No reminders yet</h3>
      <p class="text-gray-400 mb-6">Set reminders for bills and investments</p>
      <button
        @click="showAddModal = true"
        class="px-6 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold"
      >
        Set Reminder
      </button>
    </div>

    <!-- Add Reminder Modal -->
    <Modal v-model="showAddModal" title="Add Reminder" size="md">
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">Title</label>
          <input
            v-model="form.title"
            type="text"
            placeholder="e.g., Electricity Bill"
            class="w-full px-4 py-3 rounded-xl bg-dark-700 border border-white/10 text-white focus:border-primary-500 focus:outline-none"
            required
          />
        </div>

        <div>
           <label class="block text-sm font-medium text-gray-300 mb-2">Category</label>
           <div class="grid grid-cols-3 gap-2">
            <button
              v-for="cat in categories"
              :key="cat.value"
              type="button"
              @click="form.category = cat.value"
              class="p-2 rounded-xl text-center transition-all"
              :class="form.category === cat.value ? 'bg-primary-500 text-white' : 'bg-dark-700 text-gray-400 hover:bg-dark-600'"
            >
              <span class="text-xl block">{{ cat.icon }}</span>
              <span class="text-[10px]">{{ cat.label }}</span>
            </button>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Amount (Optional)</label>
            <input
              v-model.number="form.amount"
              type="number"
              min="0"
              class="w-full px-4 py-3 rounded-xl bg-dark-700 border border-white/10 text-white focus:border-primary-500 focus:outline-none"
            />
          </div>
          <div>
             <label class="block text-sm font-medium text-gray-300 mb-2">Frequency</label>
            <select
              v-model="form.frequency"
              class="w-full px-4 py-3 rounded-xl bg-dark-700 border border-white/10 text-white focus:border-primary-500 focus:outline-none"
            >
              <option v-for="freq in frequencies" :key="freq.value" :value="freq.value">
                {{ freq.label }}
              </option>
            </select>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">Next Due Date</label>
          <input
            v-model="form.reminderTime"
            type="datetime-local"
            class="w-full px-4 py-3 rounded-xl bg-dark-700 border border-white/10 text-white focus:border-primary-500 focus:outline-none"
            required
          />
        </div>
      </form>

      <template #footer>
        <button
          @click="handleSubmit"
          :disabled="!form.title || !form.reminderTime"
          class="w-full py-3 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold disabled:opacity-50"
        >
          Set Reminder
        </button>
      </template>
    </Modal>
  </div>
</template>
