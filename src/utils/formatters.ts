// Currency formatter for Indian Rupees
export function formatCurrency(amount: number, compact = false): string {
    if (compact && Math.abs(amount) >= 10000000) {
        return `₹${(amount / 10000000).toFixed(2)} Cr`;
    }
    if (compact && Math.abs(amount) >= 100000) {
        return `₹${(amount / 100000).toFixed(2)} L`;
    }
    if (compact && Math.abs(amount) >= 1000) {
        return `₹${(amount / 1000).toFixed(1)}K`;
    }

    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
}

// Format percentage
export function formatPercentage(value: number, decimals = 2): string {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(decimals)}%`;
}

// Format date
export function formatDate(timestamp: number, format: 'short' | 'long' | 'relative' = 'short'): string {
    const date = new Date(timestamp);

    if (format === 'relative') {
        const now = Date.now();
        const diff = now - timestamp;
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 7) return formatDate(timestamp, 'short');
        if (days > 0) return `${days}d ago`;
        if (hours > 0) return `${hours}h ago`;
        if (minutes > 0) return `${minutes}m ago`;
        return 'Just now';
    }

    if (format === 'long') {
        return date.toLocaleDateString('en-IN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
}

// Format time
export function formatTime(timestamp: number): string {
    return new Date(timestamp).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Format number with Indian notation
export function formatNumber(num: number): string {
    return new Intl.NumberFormat('en-IN').format(num);
}

// Truncate text
export function truncate(text: string, length: number): string {
    if (text.length <= length) return text;
    return text.slice(0, length) + '...';
}

// Asset type display names
export function getAssetTypeName(type: string): string {
    const names: Record<string, string> = {
        'STOCK': 'Stocks',
        'MUTUAL_FUND': 'Mutual Funds',
        'GOLD': 'Gold',
        'EPF': 'EPF',
        'PPF': 'PPF',
        'FD': 'Fixed Deposits',
        'RD': 'Recurring Deposits',
        'CRYPTO': 'Cryptocurrency',
        'BANK_ACCOUNT': 'Bank Accounts'
    };
    return names[type] || type;
}

// Category icons
export function getCategoryIcon(category: string): string {
    const icons: Record<string, string> = {
        'FOOD': '🍔',
        'TRANSPORT': '🚗',
        'SHOPPING': '🛒',
        'ENTERTAINMENT': '🎬',
        'BILLS': '📄',
        'HEALTH': '🏥',
        'EDUCATION': '📚',
        'TRAVEL': '✈️',
        'INVESTMENT': '📈',
        'SALARY': '💰',
        'BONUS': '🎁',
        'RENT': '🏠',
        'UTILITIES': '💡',
        'OTHER': '📌'
    };
    return icons[category] || '📌';
}
