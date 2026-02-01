import Dexie, { type Table } from 'dexie';
import type { Asset, Transaction, FinancialGoal, Trip, Reminder, UserSettings } from '@/types';

class DhanRakshakDB extends Dexie {
    assets!: Table<Asset>;
    transactions!: Table<Transaction>;
    goals!: Table<FinancialGoal>;
    trips!: Table<Trip>;
    reminders!: Table<Reminder>;
    settings!: Table<UserSettings>;

    constructor() {
        super('DhanRakshakWeb');

        this.version(1).stores({
            assets: '++id, type, name, symbol, createdAt',
            transactions: '++id, type, category, date, assetId, createdAt',
            goals: '++id, category, targetDate, createdAt',
            trips: '++id, destination, startDate, createdAt',
            reminders: '++id, category, reminderTime, frequency, createdAt',
            settings: '++id'
        });
    }
}

export const db = new DhanRakshakDB();

// Initialize default settings
export async function initializeSettings(): Promise<UserSettings> {
    const existingSettings = await db.settings.toArray();
    if (existingSettings.length === 0) {
        const defaultSettings: UserSettings = {
            darkMode: true,
            currency: 'INR',
            language: 'en',
            notifications: true,
            biometricLock: false,
            monthlyBudget: 50000,
            savingsGoalPercentage: 30
        };
        await db.settings.add(defaultSettings);
        return defaultSettings;
    }
    return existingSettings[0]!;
}

// Export/Import functionality
export async function exportData(): Promise<string> {
    const data = {
        assets: await db.assets.toArray(),
        transactions: await db.transactions.toArray(),
        goals: await db.goals.toArray(),
        trips: await db.trips.toArray(),
        reminders: await db.reminders.toArray(),
        settings: await db.settings.toArray(),
        exportedAt: Date.now()
    };
    return JSON.stringify(data, null, 2);
}

export async function importData(jsonData: string): Promise<void> {
    const data = JSON.parse(jsonData);

    await db.transaction('rw', [db.assets, db.transactions, db.goals, db.trips, db.reminders, db.settings], async () => {
        // Clear existing data
        await db.assets.clear();
        await db.transactions.clear();
        await db.goals.clear();
        await db.trips.clear();
        await db.reminders.clear();
        await db.settings.clear();

        // Import new data
        if (data.assets?.length) await db.assets.bulkAdd(data.assets);
        if (data.transactions?.length) await db.transactions.bulkAdd(data.transactions);
        if (data.goals?.length) await db.goals.bulkAdd(data.goals);
        if (data.trips?.length) await db.trips.bulkAdd(data.trips);
        if (data.reminders?.length) await db.reminders.bulkAdd(data.reminders);
        if (data.settings?.length) await db.settings.bulkAdd(data.settings);
    });
}
