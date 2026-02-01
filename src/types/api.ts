// Stock API Response
export interface StockQuote {
    symbol: string;
    name: string;
    price: number;
    change: number;
    changePercent: number;
    dayHigh: number;
    dayLow: number;
    volume: number;
    marketCap?: number;
}

// Mutual Fund API Response
export interface MutualFundNAV {
    schemeCode: string;
    schemeName: string;
    nav: number;
    date: string;
    category?: string;
}

// Crypto API Response
export interface CryptoPrice {
    id: string;
    symbol: string;
    name: string;
    priceInr: number;
    change24h: number;
    marketCap: number;
}

// API Error
export interface ApiError {
    code: string;
    message: string;
    details?: string;
}
