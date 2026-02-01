export interface MarketData {
    symbol: string;
    name: string;
    price: number;
    change: number;
    changePercent: number;
    lastUpdated: string;
}

// Mock data generator for demo purposes
// In a real app, this would fetch from an API like Alpha Vantage, Yahoo Finance, etc.
function generateMockData(symbol: string, name: string, basePrice: number, volatility: number = 0.01): MarketData {
    const changePercent = (Math.random() * volatility * 2) - volatility;
    const change = basePrice * changePercent;
    const price = basePrice + change;

    return {
        symbol,
        name,
        price,
        change,
        changePercent: changePercent * 100,
        lastUpdated: new Date().toISOString()
    };
}

// Mboum Finance API (Yahoo Finance data) via RapidAPI
const RAPID_API_KEY = import.meta.env.VITE_RAPID_API_KEY || '';
const RAPID_API_HOST = 'mboum-finance.p.rapidapi.com';

const SYMBOL_MAP: Record<string, string> = {
    'NIFTY': '%5ENSEI',    // ^NSEI
    'SENSEX': '%5EBSESN',   // ^BSESN
    'GOLD': 'GC=F',       // Gold Futures
    'SILVER': 'SI=F',     // Silver Futures
    'BTC': 'BTC-USD',     // Bitcoin USD
    'ETH': 'ETH-USD',     // Ethereum USD
    'USDINR': 'INR=X'     // USD/INR
};

export const marketApi = {
    async getMarketOverview(): Promise<MarketData[]> {
        // If no key is provided, use mock data
        if (!RAPID_API_KEY) {
            console.warn('VITE_RAPID_API_KEY not found. Using mock market data.');
            await new Promise(resolve => setTimeout(resolve, 800));
            return [
                generateMockData('NIFTY', 'NIFTY 50', 22450.30, 0.015),
                generateMockData('SENSEX', 'BSE SENSEX', 73950.15, 0.012),
                generateMockData('GOLD', 'Gold (10g)', 72500, 0.008),
                generateMockData('SILVER', 'Silver (1kg)', 84000, 0.01),
                generateMockData('BTC', 'Bitcoin (USD)', 68000, 0.03),
                generateMockData('ETH', 'Ethereum (USD)', 3500, 0.035),
                generateMockData('USDINR', 'USD/INR', 83.50, 0.002)
            ];
        }

        try {
            const symbols = Object.values(SYMBOL_MAP).join(',');
            const response = await fetch(`https://${RAPID_API_HOST}/qu/quote?symbol=${symbols}`, {
                method: 'GET',
                headers: {
                    'x-rapidapi-key': RAPID_API_KEY,
                    'x-rapidapi-host': RAPID_API_HOST
                }
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.statusText}`);
            }

            const data = await response.json();
            const results = data.body || []; // Mboum API structure usually has data in 'body'

            return Object.entries(SYMBOL_MAP).map(([displaySymbol, apiSymbol]) => {
                // Decode the symbol for matching (e.g., %5ENSEI -> ^NSEI)
                const checkSymbol = decodeURIComponent(apiSymbol);
                const quote = results.find((q: any) => q.symbol === checkSymbol);

                if (!quote) {
                    // Fallback if specific symbol fails
                    return generateMockData(displaySymbol, displaySymbol, 0, 0);
                }

                return {
                    symbol: displaySymbol,
                    name: quote.longName || quote.shortName || displaySymbol,
                    price: quote.regularMarketPrice,
                    change: quote.regularMarketChange,
                    changePercent: quote.regularMarketChangePercent,
                    lastUpdated: new Date().toISOString()
                };
            });

        } catch (e) {
            console.error('Failed to fetch market data from RapidAPI:', e);
            // Fallback to mock data on error
            return [
                generateMockData('NIFTY', 'NIFTY 50', 22450.30, 0.015),
                generateMockData('SENSEX', 'BSE SENSEX', 73950.15, 0.012),
                generateMockData('GOLD', 'Gold (10g)', 72500, 0.008),
                generateMockData('SILVER', 'Silver (1kg)', 84000, 0.01),
                generateMockData('BTC', 'Bitcoin (USD)', 68000, 0.03),
                generateMockData('ETH', 'Ethereum (USD)', 3500, 0.035),
                generateMockData('USDINR', 'USD/INR', 83.50, 0.002)
            ];
        }
    }
};
