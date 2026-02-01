<script setup lang="ts">
import Modal from '@/components/common/Modal.vue';

defineProps<{
  itemName?: string;
}>();

const show = defineModel<boolean>({ required: true });

const emit = defineEmits<{
  confirm: [];
}>();

function handleConfirm() {
  emit('confirm');
  show.value = false;
}
</script>

<template>
  <Modal v-model="show" title="Confirm Delete" size="sm">
    <div class="space-y-4">
      <div class="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3">
        <span class="text-2xl">⚠️</span>
        <div>
          <h3 class="font-semibold text-red-400">Are you sure?</h3>
          <p class="text-sm text-gray-300 mt-1">
            This action cannot be undone. This will permanently delete 
            <span class="font-semibold text-white">{{ itemName || 'this item' }}</span>.
          </p>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex gap-3 w-full">
        <button
          @click="show = false"
          class="flex-1 py-2.5 rounded-xl bg-dark-700 text-white hover:bg-dark-600 border border-white/5 transition-colors"
        >
          Cancel
        </button>
        <button
          @click="handleConfirm"
          class="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold transition-colors shadow-lg shadow-red-500/20"
        >
          Delete
        </button>
      </div>
    </template>
  </Modal>
</template>
