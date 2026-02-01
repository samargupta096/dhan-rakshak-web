import { computed } from 'vue';
import { useSettingsStore } from '@/stores/settings';
import { formatCurrency as formatCurrencyUtil, formatNumber } from '@/utils/formatters';

export function useCurrency() {
    const settingsStore = useSettingsStore();

    const currencySymbol = computed(() => {
        const symbols: Record<string, string> = {
            'INR': '₹',
            'USD': '$',
            'EUR': '€',
            'GBP': '£'
        };
        return symbols[settingsStore.settings.currency] || '₹';
    });

    function formatCurrency(amount: number, compact = false): string {
        return formatCurrencyUtil(amount, compact);
    }

    function formatWithSymbol(amount: number): string {
        return `${currencySymbol.value}${formatNumber(amount)}`;
    }

    return {
        currencySymbol,
        formatCurrency,
        formatWithSymbol
    };
}
