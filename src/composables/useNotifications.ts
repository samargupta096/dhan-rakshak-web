import { ref } from 'vue';

export function useNotifications() {
    const isSupported = ref('Notification' in window);
    const permission = ref<NotificationPermission>(
        isSupported.value ? Notification.permission : 'denied'
    );

    async function requestPermission() {
        if (!isSupported.value) return false;

        const result = await Notification.requestPermission();
        permission.value = result;
        return result === 'granted';
    }

    function showNotification(title: string, options?: NotificationOptions) {
        if (!isSupported.value || permission.value !== 'granted') {
            console.warn('Notifications not available');
            return null;
        }

        return new Notification(title, {
            icon: '/vite.svg',
            badge: '/vite.svg',
            ...options
        });
    }

    function scheduleNotification(
        title: string,
        options: NotificationOptions,
        delayMs: number
    ) {
        return setTimeout(() => {
            showNotification(title, options);
        }, delayMs);
    }

    return {
        isSupported,
        permission,
        requestPermission,
        showNotification,
        scheduleNotification
    };
}
