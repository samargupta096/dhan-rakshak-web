// Asset Types
export type AssetType = 'STOCK' | 'MUTUAL_FUND' | 'GOLD' | 'EPF' | 'PPF' | 'FD' | 'RD' | 'CRYPTO' | 'BANK_ACCOUNT';

export interface Asset {
    id?: number;
    name: string;
    symbol?: string;
    type: AssetType;
    quantity: number;
    buyPrice: number;
    currentPrice: number;
    purchaseDate?: number;
    createdAt: number;
    updatedAt?: number;
}

// Transaction Types
export type TransactionType = 'CREDIT' | 'DEBIT';

export interface Transaction {
    id?: number;
    amount: number;
    type: TransactionType;
    category: string;
    description: string;
    date: number;
    assetId?: number;
    createdAt: number;
}

// Financial Goal
export interface FinancialGoal {
    id?: number;
    name: string;
    targetAmount: number;
    currentAmount: number;
    targetDate: number;
    category: string;
    icon?: string;
    color?: string;
    createdAt: number;
}

// Trip
export interface Trip {
    id?: number;
    name: string;
    destination: string;
    startDate: number;
    endDate: number;
    budget: number;
    spent: number;
    notes?: string;
    createdAt: number;
}

// Reminder
export type ReminderFrequency = 'ONCE' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

export interface Reminder {
    id?: number;
    title: string;
    description?: string;
    category: string;
    amount?: number;
    reminderTime: number;
    frequency: ReminderFrequency;
    isEnabled: boolean;
    lastTriggered?: number;
    createdAt: number;
}

// User Settings
export interface UserSettings {
    id?: number;
    darkMode: boolean;
    currency: string;
    language: string;
    notifications: boolean;
    biometricLock: boolean;
    monthlyBudget: number;
    savingsGoalPercentage: number;
}

// Dashboard Stats
export interface DashboardStats {
    netWorth: number;
    totalInvestments: number;
    totalSavings: number;
    monthlyExpenses: number;
    monthlyIncome: number;
    changePercentage: number;
    changeAmount: number;
}

// Asset Allocation
export interface AssetAllocation {
    type: AssetType;
    value: number;
    percentage: number;
    color: string;
}

// Chart Data
export interface ChartDataPoint {
    label: string;
    value: number;
    date?: number;
}
