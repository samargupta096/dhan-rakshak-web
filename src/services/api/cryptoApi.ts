// Cryptocurrency Price API Service
// Uses CoinGecko public API (no key required for basic usage)

export interface CryptoPrice {
    id: string;
    symbol: string;
    name: string;
    currentPrice: number;
    priceChange24h: number;
    priceChangePercentage24h: number;
    marketCap: number;
    volume24h: number;
    lastUpdated: number;
}

const COINGECKO_API = 'https://api.coingecko.com/api/v3';

/**
 * Fetch cryptocurrency price in INR
 */
export async function fetchCryptoPrice(coinId: string): Promise<CryptoPrice | null> {
    try {
        const response = await fetch(
            `${COINGECKO_API}/coins/markets?vs_currency=inr&ids=${coinId}&order=market_cap_desc&per_page=1&page=1&sparkline=false`
        );

        if (!response.ok) {
            console.error(`Failed to fetch crypto data for ${coinId}`);
            return null;
        }

        const data = await response.json();
        if (!data || data.length === 0) return null;

        const coin = data[0];

        return {
            id: coin.id,
            symbol: coin.symbol.toUpperCase(),
            name: coin.name,
            currentPrice: coin.current_price,
            priceChange24h: coin.price_change_24h,
            priceChangePercentage24h: coin.price_change_percentage_24h,
            marketCap: coin.market_cap,
            volume24h: coin.total_volume,
            lastUpdated: Date.now()
        };
    } catch (error) {
        console.error('Error fetching crypto data:', error);
        return null;
    }
}

/**
 * Fetch multiple cryptocurrencies
 */
export async function fetchMultipleCrypto(coinIds: string[]): Promise<Map<string, CryptoPrice>> {
    try {
        const idsParam = coinIds.join(',');
        const response = await fetch(
            `${COINGECKO_API}/coins/markets?vs_currency=inr&ids=${idsParam}&order=market_cap_desc&per_page=100&page=1&sparkline=false`
        );

        if (!response.ok) {
            console.error('Failed to fetch crypto data');
            return new Map();
        }

        const data = await response.json();
        const results = new Map<string, CryptoPrice>();

        for (const coin of data) {
            results.set(coin.id, {
                id: coin.id,
                symbol: coin.symbol.toUpperCase(),
                name: coin.name,
                currentPrice: coin.current_price,
                priceChange24h: coin.price_change_24h,
                priceChangePercentage24h: coin.price_change_percentage_24h,
                marketCap: coin.market_cap,
                volume24h: coin.total_volume,
                lastUpdated: Date.now()
            });
        }

        return results;
    } catch (error) {
        console.error('Error fetching multiple crypto:', error);
        return new Map();
    }
}

/**
 * Search cryptocurrencies
 */
export async function searchCrypto(query: string): Promise<Array<{ id: string; name: string; symbol: string }>> {
    try {
        const response = await fetch(`${COINGECKO_API}/search?query=${encodeURIComponent(query)}`);

        if (!response.ok) return [];

        const data = await response.json();

        return data.coins.slice(0, 10).map((coin: any) => ({
            id: coin.id,
            name: coin.name,
            symbol: coin.symbol.toUpperCase()
        }));
    } catch (error) {
        console.error('Error searching crypto:', error);
        return [];
    }
}

/**
 * Popular cryptocurrencies
 */
export const POPULAR_CRYPTO = [
    { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC' },
    { id: 'ethereum', name: 'Ethereum', symbol: 'ETH' },
    { id: 'tether', name: 'Tether', symbol: 'USDT' },
    { id: 'binancecoin', name: 'BNB', symbol: 'BNB' },
    { id: 'ripple', name: 'XRP', symbol: 'XRP' },
    { id: 'cardano', name: 'Cardano', symbol: 'ADA' },
    { id: 'dogecoin', name: 'Dogecoin', symbol: 'DOGE' },
    { id: 'solana', name: 'Solana', symbol: 'SOL' },
    { id: 'polkadot', name: 'Polkadot', symbol: 'DOT' },
    { id: 'matic-network', name: 'Polygon', symbol: 'MATIC' },
];
