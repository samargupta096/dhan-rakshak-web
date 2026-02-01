// Indian Stock Market API Service
// Uses Yahoo Finance API (free, no key required)

export interface StockData {
    symbol: string;
    price: number;
    change: number;
    changePercent: number;
    volume: number;
    marketCap: number;
    lastUpdated: number;
}

const BASE_URL = 'https://query1.finance.yahoo.com/v8/finance/chart';

/**
 * Fetch stock data from Yahoo Finance for NSE/BSE stocks
 * @param symbol - Stock symbol (e.g., 'RELIANCE.NS' for NSE, 'RELIANCE.BO' for BSE)
 */
export async function fetchStockPrice(symbol: string): Promise<StockData | null> {
    try {
        // Ensure symbol has exchange suffix
        const fullSymbol = symbol.includes('.') ? symbol : `${symbol}.NS`;

        const response = await fetch(`${BASE_URL}/${fullSymbol}?interval=1d&range=1d`);

        if (!response.ok) {
            console.error(`Failed to fetch stock data for ${fullSymbol}`);
            return null;
        }

        const data = await response.json();
        const quote = data.chart.result[0];
        const meta = quote.meta;
        const indicators = quote.indicators.quote[0];

        return {
            symbol: fullSymbol,
            price: meta.regularMarketPrice || 0,
            change: meta.regularMarketPrice - meta.previousClose || 0,
            changePercent: ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose * 100) || 0,
            volume: indicators.volume?.[0] || 0,
            marketCap: meta.marketCap || 0,
            lastUpdated: Date.now()
        };
    } catch (error) {
        console.error('Error fetching stock data:', error);
        return null;
    }
}

/**
 * Fetch multiple stocks in batch
 */
export async function fetchMultipleStocks(symbols: string[]): Promise<Map<string, StockData>> {
    const results = new Map<string, StockData>();

    // Fetch in parallel but with rate limiting
    const promises = symbols.map(async (symbol, index) => {
        // Add delay to avoid rate limiting (100ms between requests)
        await new Promise(resolve => setTimeout(resolve, index * 100));
        const data = await fetchStockPrice(symbol);
        if (data) {
            results.set(symbol, data);
        }
    });

    await Promise.all(promises);
    return results;
}

/**
 * Search for Indian stocks by name or symbol
 */
export async function searchStocks(query: string): Promise<Array<{ symbol: string; name: string; exchange: string }>> {
    try {
        const response = await fetch(`https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=10&newsCount=0`);

        if (!response.ok) return [];

        const data = await response.json();

        // Filter for Indian stocks (NSE/BSE)
        return data.quotes
            .filter((q: any) => q.exchange === 'NSI' || q.exchange === 'BSE')
            .map((q: any) => ({
                symbol: q.symbol,
                name: q.longname || q.shortname,
                exchange: q.exchange
            }));
    } catch (error) {
        console.error('Error searching stocks:', error);
        return [];
    }
}

/**
 * Common Indian stock symbols helper
 */
export const POPULAR_INDIAN_STOCKS = [
    { symbol: 'RELIANCE.NS', name: 'Reliance Industries' },
    { symbol: 'TCS.NS', name: 'Tata Consultancy Services' },
    { symbol: 'HDFCBANK.NS', name: 'HDFC Bank' },
    { symbol: 'INFY.NS', name: 'Infosys' },
    { symbol: 'HINDUNILVR.NS', name: 'Hindustan Unilever' },
    { symbol: 'ICICIBANK.NS', name: 'ICICI Bank' },
    { symbol: 'BAJFINANCE.NS', name: 'Bajaj Finance' },
    { symbol: 'BHARTIARTL.NS', name: 'Bharti Airtel' },
    { symbol: 'SBIN.NS', name: 'State Bank of India' },
    { symbol: 'ITC.NS', name: 'ITC Limited' },
];
