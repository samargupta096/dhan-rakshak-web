import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { db } from '@/services/db/indexedDb';
import type { Asset, AssetType, AssetAllocation } from '@/types';
import { fetchStockPrice, fetchMutualFundNAV, fetchCryptoPrice } from '@/services/api';

export const usePortfolioStore = defineStore('portfolio', () => {
    const assets = ref<Asset[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);
    const refreshing = ref(false);

    // Computed properties
    const netWorth = computed(() =>
        assets.value.reduce((sum, a) => sum + (a.quantity * a.currentPrice), 0)
    );

    const totalInvested = computed(() =>
        assets.value.reduce((sum, a) => sum + (a.quantity * a.buyPrice), 0)
    );

    const totalGain = computed(() => netWorth.value - totalInvested.value);

    const gainPercentage = computed(() =>
        totalInvested.value > 0 ? (totalGain.value / totalInvested.value) * 100 : 0
    );

    const assetsByType = computed(() => {
        const grouped: Record<AssetType, Asset[]> = {} as Record<AssetType, Asset[]>;
        assets.value.forEach(asset => {
            if (!grouped[asset.type]) {
                grouped[asset.type] = [];
            }
            grouped[asset.type].push(asset);
        });
        return grouped;
    });

    const typeColors: Record<AssetType, string> = {
        'STOCK': '#8b5cf6',
        'MUTUAL_FUND': '#06b6d4',
        'GOLD': '#f59e0b',
        'EPF': '#10b981',
        'PPF': '#22c55e',
        'FD': '#3b82f6',
        'RD': '#6366f1',
        'CRYPTO': '#ec4899',
        'BANK_ACCOUNT': '#14b8a6'
    };

    const assetAllocation = computed((): AssetAllocation[] => {
        const allocation: AssetAllocation[] = [];
        const total = netWorth.value;

        Object.entries(assetsByType.value).forEach(([type, typeAssets]) => {
            const value = typeAssets.reduce((sum, a) => sum + (a.quantity * a.currentPrice), 0);
            if (value > 0) {
                allocation.push({
                    type: type as AssetType,
                    value,
                    percentage: total > 0 ? (value / total) * 100 : 0,
                    color: typeColors[type as AssetType]
                });
            }
        });

        return allocation.sort((a, b) => b.value - a.value);
    });

    const stocksValue = computed(() =>
        assets.value.filter(a => a.type === 'STOCK')
            .reduce((sum, a) => sum + (a.quantity * a.currentPrice), 0)
    );

    const mutualFundsValue = computed(() =>
        assets.value.filter(a => a.type === 'MUTUAL_FUND')
            .reduce((sum, a) => sum + (a.quantity * a.currentPrice), 0)
    );

    // Actions
    async function loadAssets() {
        loading.value = true;
        error.value = null;
        try {
            assets.value = await db.assets.toArray();
        } catch (e) {
            error.value = 'Failed to load assets';
            console.error(e);
        } finally {
            loading.value = false;
        }
    }

    async function addAsset(asset: Omit<Asset, 'id' | 'createdAt'>) {
        try {
            const id = await db.assets.add({
                ...asset,
                createdAt: Date.now(),
                updatedAt: Date.now()
            });
            await loadAssets();
            return id;
        } catch (e) {
            error.value = 'Failed to add asset';
            console.error(e);
            throw e;
        }
    }

    async function updateAsset(id: number, updates: Partial<Asset>) {
        try {
            await db.assets.update(id, { ...updates, updatedAt: Date.now() });
            await loadAssets();
        } catch (e) {
            error.value = 'Failed to update asset';
            console.error(e);
            throw e;
        }
    }

    async function updatePrice(id: number, price: number) {
        await updateAsset(id, { currentPrice: price });
    }

    async function deleteAsset(id: number) {
        try {
            await db.assets.delete(id);
            await loadAssets();
        } catch (e) {
            error.value = 'Failed to delete asset';
            console.error(e);
            throw e;
        }
    }

    /**
     * Refresh prices for all assets from public APIs
     */
    async function refreshAllPrices() {
        refreshing.value = true;
        let updated = 0;

        try {
            for (const asset of assets.value) {
                try {
                    let newPrice: number | null = null;

                    // Fetch price based on asset type
                    if (asset.type === 'STOCK' && asset.symbol) {
                        const stockData = await fetchStockPrice(asset.symbol);
                        newPrice = stockData?.price || null;
                    } else if (asset.type === 'MUTUAL_FUND' && asset.symbol) {
                        const mfData = await fetchMutualFundNAV(asset.symbol);
                        newPrice = mfData?.nav || null;
                    } else if (asset.type === 'CRYPTO' && asset.symbol) {
                        // Convert symbol to CoinGecko ID (e.g., BTC -> bitcoin)
                        const cryptoId = asset.symbol.toLowerCase();
                        const cryptoData = await fetchCryptoPrice(cryptoId);
                        newPrice = cryptoData?.currentPrice || null;
                    }

                    // Update if new price found
                    if (newPrice && newPrice > 0 && asset.id) {
                        await updatePrice(asset.id, newPrice);
                        updated++;
                    }
                } catch (e) {
                    console.error(`Failed to update price for ${asset.name}:`, e);
                }
            }

            return { success: true, updated };
        } catch (e) {
            error.value = 'Failed to refresh prices';
            console.error(e);
            return { success: false, updated };
        } finally {
            refreshing.value = false;
        }
    }

    return {
        assets,
        loading,
        error,
        refreshing,
        netWorth,
        totalInvested,
        totalGain,
        gainPercentage,
        assetsByType,
        assetAllocation,
        stocksValue,
        mutualFundsValue,
        loadAssets,
        addAsset,
        updateAsset,
        updatePrice,
        deleteAsset,
        refreshAllPrices
    };
});
