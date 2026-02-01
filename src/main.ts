import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { useSettingsStore } from './stores/settings'
import { useAuthStore } from './stores/auth'
import App from './App.vue'
import router from './router'
import './style.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

app.mount('#app')

// Initialize settings on app load
const settingsStore = useSettingsStore()
settingsStore.loadSettings()

// Initialize auth listener
const authStore = useAuthStore()
authStore.initAuth()
