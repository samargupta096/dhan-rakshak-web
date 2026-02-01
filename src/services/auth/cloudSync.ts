// Firestore Cloud Sync Service
// Syncs all user data (portfolio, transactions, goals, etc.) to Firebase Cloud

import {
    getFirestore,
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    deleteDoc,
    query,
    where,
    type Firestore
} from 'firebase/firestore';
import { auth } from './firebase';
import type { Asset, Transaction, FinancialGoal, Trip, Reminder, UserSettings } from '@/types';

let db: Firestore | null = null;

/**
 * Initialize Firestore
 */
export function initFirestore() {
    if (!db) {
        db = getFirestore();
    }
    return db;
}

/**
 * Get user's collection reference
 */
function getUserCollection(collectionName: string) {
    const firestore = initFirestore();
    const userId = auth.currentUser?.uid;

    if (!userId) {
        throw new Error('User not authenticated');
    }

    return collection(firestore, `users/${userId}/${collectionName}`);
}

// ==================== ASSETS ====================

export async function syncAssets(assets: Asset[]): Promise<void> {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const assetsCol = getUserCollection('assets');

    // Upload all assets
    for (const asset of assets) {
        if (asset.id) {
            await setDoc(doc(assetsCol, asset.id.toString()), asset);
        }
    }
}

export async function fetchAssets(): Promise<Asset[]> {
    const userId = auth.currentUser?.uid;
    if (!userId) return [];

    const assetsCol = getUserCollection('assets');
    const snapshot = await getDocs(assetsCol);

    return snapshot.docs.map(doc => doc.data() as Asset);
}

export async function deleteAssetFromCloud(assetId: number): Promise<void> {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const assetsCol = getUserCollection('assets');
    await deleteDoc(doc(assetsCol, assetId.toString()));
}

// ==================== TRANSACTIONS ====================

export async function syncTransactions(transactions: Transaction[]): Promise<void> {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const transactionsCol = getUserCollection('transactions');

    for (const transaction of transactions) {
        if (transaction.id) {
            await setDoc(doc(transactionsCol, transaction.id.toString()), transaction);
        }
    }
}

export async function fetchTransactions(): Promise<Transaction[]> {
    const userId = auth.currentUser?.uid;
    if (!userId) return [];

    const transactionsCol = getUserCollection('transactions');
    const snapshot = await getDocs(transactionsCol);

    return snapshot.docs.map(doc => doc.data() as Transaction);
}

// ==================== GOALS ====================

export async function syncGoals(goals: FinancialGoal[]): Promise<void> {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const goalsCol = getUserCollection('goals');

    for (const goal of goals) {
        if (goal.id) {
            await setDoc(doc(goalsCol, goal.id.toString()), goal);
        }
    }
}

export async function fetchGoals(): Promise<FinancialGoal[]> {
    const userId = auth.currentUser?.uid;
    if (!userId) return [];

    const goalsCol = getUserCollection('goals');
    const snapshot = await getDocs(goalsCol);

    return snapshot.docs.map(doc => doc.data() as FinancialGoal);
}

// ==================== TRIPS ====================

export async function syncTrips(trips: Trip[]): Promise<void> {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const tripsCol = getUserCollection('trips');

    for (const trip of trips) {
        if (trip.id) {
            await setDoc(doc(tripsCol, trip.id.toString()), trip);
        }
    }
}

export async function fetchTrips(): Promise<Trip[]> {
    const userId = auth.currentUser?.uid;
    if (!userId) return [];

    const tripsCol = getUserCollection('trips');
    const snapshot = await getDocs(tripsCol);

    return snapshot.docs.map(doc => doc.data() as Trip);
}

// ==================== REMINDERS ====================

export async function syncReminders(reminders: Reminder[]): Promise<void> {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const remindersCol = getUserCollection('reminders');

    for (const reminder of reminders) {
        if (reminder.id) {
            await setDoc(doc(remindersCol, reminder.id.toString()), reminder);
        }
    }
}

export async function fetchReminders(): Promise<Reminder[]> {
    const userId = auth.currentUser?.uid;
    if (!userId) return [];

    const remindersCol = getUserCollection('reminders');
    const snapshot = await getDocs(remindersCol);

    return snapshot.docs.map(doc => doc.data() as Reminder);
}

// ==================== SETTINGS ====================

export async function syncSettings(settings: UserSettings): Promise<void> {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const firestore = initFirestore();
    await setDoc(doc(firestore, `users/${userId}/settings/preferences`), settings);
}

export async function fetchSettings(): Promise<UserSettings | null> {
    const userId = auth.currentUser?.uid;
    if (!userId) return null;

    const firestore = initFirestore();
    const docRef = doc(firestore, `users/${userId}/settings/preferences`);
    const docSnap = await getDoc(docRef);

    return docSnap.exists() ? docSnap.data() as UserSettings : null;
}

// ==================== FULL SYNC ====================

/**
 * Sync all data to cloud
 */
export async function syncAllToCloud(data: {
    assets: Asset[];
    transactions: Transaction[];
    goals: FinancialGoal[];
    trips: Trip[];
    reminders: Reminder[];
    settings: UserSettings;
}): Promise<void> {
    const userId = auth.currentUser?.uid;
    if (!userId) {
        throw new Error('User must be logged in to sync');
    }

    await Promise.all([
        syncAssets(data.assets),
        syncTransactions(data.transactions),
        syncGoals(data.goals),
        syncTrips(data.trips),
        syncReminders(data.reminders),
        syncSettings(data.settings)
    ]);
}

/**
 * Fetch all data from cloud
 */
export async function fetchAllFromCloud(): Promise<{
    assets: Asset[];
    transactions: Transaction[];
    goals: FinancialGoal[];
    trips: Trip[];
    reminders: Reminder[];
    settings: UserSettings | null;
}> {
    const userId = auth.currentUser?.uid;
    if (!userId) {
        throw new Error('User must be logged in to fetch');
    }

    const [assets, transactions, goals, trips, reminders, settings] = await Promise.all([
        fetchAssets(),
        fetchTransactions(),
        fetchGoals(),
        fetchTrips(),
        fetchReminders(),
        fetchSettings()
    ]);

    return {
        assets,
        transactions,
        goals,
        trips,
        reminders,
        settings: settings || {
            darkMode: true,
            currency: 'INR',
            language: 'en',
            notifications: true,
            biometricLock: false,
            monthlyBudget: 50000,
            savingsGoalPercentage: 30
        }
    };
}
