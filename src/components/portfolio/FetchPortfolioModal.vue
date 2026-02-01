<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import Modal from '@/components/common/Modal.vue';
import { initRecaptcha, sendOTP, verifyOTP, requestPortfolioViaCAS } from '@/services/auth/phoneAuth';
import { getCAMSSMSRequest, getKFintechSMSRequest, openSMSApp } from '@/services/smsRequest';

const show = defineModel<boolean>({ required: true });
const router = useRouter();

const step = ref<'phone' | 'otp' | 'pan' | 'success'>('phone');
const phoneNumber = ref('');
const otp = ref('');
const pan = ref('');
const loading = ref(false);
const error = ref('');

import { nextTick, watch } from 'vue';

watch(() => show.value, async (newVal) => {
  if (newVal && step.value === 'phone') {
    await nextTick();
    const container = document.getElementById('recaptcha-container');
    if (container && !container.hasChildNodes()) {
      try {
        initRecaptcha('recaptcha-container');
      } catch (e) {
        console.error('Failed to init recaptcha', e);
      }
    }
  }
});

async function handleSendOTP() {
  if (!phoneNumber.value || phoneNumber.value.length !== 10) {
    error.value = 'Please enter a valid 10-digit mobile number';
    return;
  }

  loading.value = true;
  error.value = '';

  try {
    await sendOTP(phoneNumber.value);
    step.value = 'otp';
  } catch (e: any) {
    error.value = e.message || 'Failed to send OTP';
  } finally {
    loading.value = false;
  }
}

async function handleVerifyOTP() {
  if (!otp.value || otp.value.length !== 6) {
    error.value = 'Please enter a valid 6-digit OTP';
    return;
  }

  loading.value = true;
  error.value = '';

  try {
    const verified = await verifyOTP(otp.value);
    if (verified) {
      step.value = 'pan';
    }
  } catch (e: any) {
    error.value = e.message || 'Invalid OTP';
  } finally {
    loading.value = false;
  }
}

async function handleRequestPortfolio() {
  if (!pan.value || pan.value.length !== 10) {
    error.value = 'Please enter a valid 10-character PAN';
    return;
  }

  loading.value = true;
  error.value = '';

  try {
    // Auto-send SMS requests
    const camsRequest = getCAMSSMSRequest(pan.value);
    const kfintechRequest = getKFintechSMSRequest(pan.value);
    
    openSMSApp(camsRequest);
    
    // Wait a bit and open second SMS
    setTimeout(() => {
      openSMSApp(kfintechRequest);
    }, 1000);

    step.value = 'success';
  } catch (e: any) {
    error.value = e.message || 'Failed to request portfolio';
  } finally {
    loading.value = false;
  }
}

function handleDone() {
  show.value = false;
  router.push('/portfolio');
  // Reset for next time
  setTimeout(() => {
    step.value = 'phone';
    phoneNumber.value = '';
    otp.value = '';
    pan.value = '';
  }, 500);
}
</script>

<template>
  <Modal v-model="show" title="Fetch Your Portfolio" size="md">
    <!-- Phone Number Step -->
    <div v-if="step === 'phone'" class="space-y-4">
      <div class="bg-primary-500/10 border border-primary-500/20 rounded-xl p-4">
        <h3 class="font-semibold text-primary-400 mb-2">📱 Verify Your Mobile Number</h3>
        <p class="text-sm text-gray-300">
          Enter your registered mobile number to receive an OTP and fetch your portfolio automatically.
        </p>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-300 mb-2">Mobile Number</label>
        <div class="flex gap-2">
          <span class="px-4 py-3 bg-dark-700 border border-white/10 rounded-xl text-white">+91</span>
          <input
            v-model="phoneNumber"
            type="tel"
            placeholder="9876543210"
            maxlength="10"
            class="flex-1 px-4 py-3 rounded-xl bg-dark-700 border border-white/10 text-white focus:border-primary-500 focus:outline-none"
          />
        </div>
      </div>

      <p v-if="error" class="text-red-400 text-sm">{{ error }}</p>

      <div id="recaptcha-container"></div>
    </div>

    <!-- OTP Verification Step -->
    <div v-if="step === 'otp'" class="space-y-4">
      <div class="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
        <h3 class="font-semibold text-green-400 mb-2">✅ OTP Sent!</h3>
        <p class="text-sm text-gray-300">
          We've sent a 6-digit OTP to +91{{ phoneNumber }}
        </p>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-300 mb-2">Enter OTP</label>
        <input
          v-model="otp"
          type="text"
          placeholder="123456"
          maxlength="6"
          class="w-full px-4 py-3 rounded-xl bg-dark-700 border border-white/10 text-white text-center text-2xl tracking-widest focus:border-primary-500 focus:outline-none"
        />
      </div>

      <p v-if="error" class="text-red-400 text-sm">{{ error }}</p>
    </div>

    <!-- PAN Entry Step -->
    <div v-if="step === 'pan'" class="space-y-4">
      <div class="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
        <h3 class="font-semibold text-blue-400 mb-2">🎯 Almost There!</h3>
        <p class="text-sm text-gray-300">
          Enter your PAN to fetch your portfolio from CAMS and KFintech.
        </p>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-300 mb-2">PAN Number</label>
        <input
          v-model="pan"
          type="text"
          placeholder="ABCDE1234F"
          maxlength="10"
          class="w-full px-4 py-3 rounded-xl bg-dark-700 border border-white/10 text-white uppercase focus:border-primary-500 focus:outline-none"
        />
      </div>

      <p v-if="error" class="text-red-400 text-sm">{{ error }}</p>
    </div>

    <!-- Success Step -->
    <div v-if="step === 'success'" class="space-y-4 text-center">
      <div class="text-6xl mb-4">🎉</div>
      <h3 class="text-2xl font-bold text-white">Portfolio Requested!</h3>
      <p class="text-gray-300">
        You will receive your Consolidated Account Statement (CAS) via email within 30 minutes.
      </p>
      <div class="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
        <p class="text-sm text-yellow-300">
          💡 <strong>Next Steps:</strong> Once you receive the CAS email, come back here and click "Import MF" to upload it!
        </p>
      </div>
    </div>

    <template #footer>
      <div v-if="step === 'phone'" class="flex gap-3 w-full">
        <button
          @click="show = false"
          class="flex-1 py-3 rounded-xl bg-dark-700 text-white hover:bg-dark-600"
        >
          Cancel
        </button>
        <button
          @click="handleSendOTP"
          :disabled="loading || phoneNumber.length !== 10"
          class="flex-1 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold disabled:opacity-50"
        >
          {{ loading ? 'Sending...' : 'Send OTP' }}
        </button>
      </div>

      <div v-if="step === 'otp'" class="flex gap-3 w-full">
        <button
          @click="step = 'phone'"
          class="flex-1 py-3 rounded-xl bg-dark-700 text-white hover:bg-dark-600"
        >
          ← Back
        </button>
        <button
          @click="handleVerifyOTP"
          :disabled="loading || otp.length !== 6"
          class="flex-1 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold disabled:opacity-50"
        >
          {{ loading ? 'Verifying...' : 'Verify OTP' }}
        </button>
      </div>

      <div v-if="step === 'pan'" class="flex gap-3 w-full">
        <button
          @click="step = 'otp'"
          class="flex-1 py-3 rounded-xl bg-dark-700 text-white hover:bg-dark-600"
        >
          ← Back
        </button>
        <button
          @click="handleRequestPortfolio"
          :disabled="loading || pan.length !== 10"
          class="flex-1 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold disabled:opacity-50"
        >
          {{ loading ? 'Requesting...' : 'Fetch Portfolio' }}
        </button>
      </div>

      <div v-if="step === 'success'" class="w-full">
        <button
          @click="handleDone"
          class="w-full py-3 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold"
        >
          Done
        </button>
      </div>
    </template>
  </Modal>
</template>
