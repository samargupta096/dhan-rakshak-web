<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useTripsStore } from '@/stores/trips';
import Modal from '@/components/common/Modal.vue';
import { formatCurrency, formatDate } from '@/utils/formatters';

const tripsStore = useTripsStore();
const showAddModal = ref(false);

const form = ref({
  name: '',
  destination: '',
  startDate: '',
  endDate: '',
  budget: 0,
  spent: 0,
  notes: ''
});

onMounted(() => {
  tripsStore.loadTrips();
});

async function handleSubmit() {
  if (!form.value.name || form.value.budget <= 0) return;
  
  await tripsStore.addTrip({
    name: form.value.name,
    destination: form.value.destination,
    startDate: new Date(form.value.startDate).getTime(),
    endDate: new Date(form.value.endDate).getTime(),
    budget: form.value.budget,
    spent: form.value.spent,
    notes: form.value.notes
  });
  
  form.value = {
    name: '',
    destination: '',
    startDate: '',
    endDate: '',
    budget: 0,
    spent: 0,
    notes: ''
  };
  
  showAddModal.value = false;
}

async function handleDelete(id: number) {
  if (confirm('Delete this trip plan?')) {
    await tripsStore.deleteTrip(id);
  }
}

async function handleAddExpense(id: number) {
  const amount = prompt('Enter expense amount:');
  if (amount && !isNaN(Number(amount))) {
    await tripsStore.addExpenseToTrip(id, Number(amount));
  }
}
</script>

<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-white">Trip Planner ✈️</h1>
        <p class="text-gray-400 mt-1">Manage your travel budgets</p>
      </div>
      <button
        @click="showAddModal = true"
        class="px-6 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold hover:from-primary-600 hover:to-accent-600 transition-all shadow-lg shadow-primary-500/25 flex items-center gap-2"
      >
        <span>➕</span>
        Plan Trip
      </button>
    </div>

    <!-- Active Trips -->
    <div v-if="tripsStore.trips.length > 0" class="grid sm:grid-cols-2 gap-4">
      <div 
        v-for="trip in tripsStore.trips" 
        :key="trip.id"
        class="bg-dark-800 rounded-xl overflow-hidden border border-white/5 hover:border-primary-500/30 transition-all group"
      >
        <!-- Trip Header -->
        <div class="h-24 bg-gradient-to-r from-blue-600 to-primary-600 relative p-4">
          <div class="absolute inset-0 bg-black/20"></div>
          <div class="relative z-10 flex justify-between items-start">
            <div>
              <h3 class="font-bold text-lg text-white">{{ trip.destination }}</h3>
              <p class="text-sm text-white/80">{{ formatDate(trip.startDate) }} - {{ formatDate(trip.endDate) }}</p>
            </div>
            <button 
              @click="handleDelete(trip.id!)"
              class="p-2 rounded-lg bg-black/20 hover:bg-black/40 text-white transition-colors opacity-0 group-hover:opacity-100"
            >
              🗑️
            </button>
          </div>
        </div>

        <!-- content -->
        <div class="p-5">
          <div class="flex justify-between items-center mb-2">
            <h4 class="font-semibold text-white">{{ trip.name }}</h4>
            <span 
              class="text-xs px-2 py-1 rounded-full border"
              :class="trip.spent > trip.budget ? 'bg-red-500/10 border-red-500/20 text-red-300' : 'bg-green-500/10 border-green-500/20 text-green-300'"
            >
              {{ trip.spent > trip.budget ? 'Over Budget' : 'On Track' }}
            </span>
          </div>

          <div class="space-y-3 mt-4">
             <div class="flex justify-between text-sm">
              <span class="text-gray-400">Budget Used</span>
              <span class="font-semibold text-white">{{ ((trip.spent / trip.budget) * 100).toFixed(0) }}%</span>
            </div>
            
            <div class="h-2 bg-dark-700 rounded-full overflow-hidden">
              <div 
                class="h-full rounded-full transition-all duration-500"
                :class="trip.spent > trip.budget ? 'bg-red-500' : 'bg-primary-500'"
                :style="{ width: `${Math.min((trip.spent / trip.budget) * 100, 100)}%` }"
              ></div>
            </div>

            <div class="flex justify-between text-sm">
              <div>
                <p class="text-gray-500 text-xs">Spent</p>
                <p class="text-gray-300">{{ formatCurrency(trip.spent, true) }}</p>
              </div>
              <div class="text-right">
                <p class="text-gray-500 text-xs">Budget</p>
                <p class="text-gray-300">{{ formatCurrency(trip.budget, true) }}</p>
              </div>
            </div>
          </div>
          
          <div class="mt-4 pt-4 border-t border-white/5">
             <button
              @click="handleAddExpense(trip.id!)"
              class="w-full py-2 rounded-lg bg-dark-700 hover:bg-dark-600 text-primary-400 text-sm font-medium transition-colors"
            >
              + Add Expense
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-16">
      <span class="text-6xl mb-4 block">✈️</span>
      <h3 class="text-xl font-semibold text-white mb-2">No trips planned</h3>
      <p class="text-gray-400 mb-6">Plan your next adventure budget</p>
      <button
        @click="showAddModal = true"
        class="px-6 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold"
      >
        Plan a Trip
      </button>
    </div>

    <!-- Add Trip Modal -->
    <Modal v-model="showAddModal" title="Plan New Trip" size="md">
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">Trip Name</label>
          <input
            v-model="form.name"
            type="text"
            placeholder="e.g., Summer Vacation"
            class="w-full px-4 py-3 rounded-xl bg-dark-700 border border-white/10 text-white focus:border-primary-500 focus:outline-none"
            required
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">Destination</label>
          <input
            v-model="form.destination"
            type="text"
            placeholder="e.g., Goa, India"
            class="w-full px-4 py-3 rounded-xl bg-dark-700 border border-white/10 text-white focus:border-primary-500 focus:outline-none"
            required
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Start Date</label>
            <input
              v-model="form.startDate"
              type="date"
              class="w-full px-4 py-3 rounded-xl bg-dark-700 border border-white/10 text-white focus:border-primary-500 focus:outline-none"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">End Date</label>
            <input
              v-model="form.endDate"
              type="date"
              class="w-full px-4 py-3 rounded-xl bg-dark-700 border border-white/10 text-white focus:border-primary-500 focus:outline-none"
              required
            />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">Budget (₹)</label>
          <input
            v-model.number="form.budget"
            type="number"
            min="0"
            class="w-full px-4 py-3 rounded-xl bg-dark-700 border border-white/10 text-white focus:border-primary-500 focus:outline-none"
            required
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">Notes</label>
          <textarea
            v-model="form.notes"
            rows="3"
            class="w-full px-4 py-3 rounded-xl bg-dark-700 border border-white/10 text-white focus:border-primary-500 focus:outline-none"
          ></textarea>
        </div>
      </form>

      <template #footer>
        <button
          @click="handleSubmit"
          :disabled="!form.name || form.budget <= 0"
          class="w-full py-3 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold disabled:opacity-50"
        >
          Create Trip Plan
        </button>
      </template>
    </Modal>
  </div>
</template>
