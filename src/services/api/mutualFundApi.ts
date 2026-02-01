// AMFI (Association of Mutual Funds in India) API Service
// Official AMFI NAV data - completely free and public

export interface MutualFundNAV {
    schemeCode: string;
    schemeName: string;
    nav: number;
    date: string;
    lastUpdated: number;
}

const AMFI_NAV_URL = 'https://www.amfiindia.com/spages/NAVAll.txt';

/**
 * Parse AMFI NAV data (format: Scheme Code;ISIN Div Payout/ ISIN Growth;ISIN Div Reinvestment;Scheme Name;Net Asset Value;Date)
 */
function parseAMFIData(data: string): Map<string, MutualFundNAV> {
    const funds = new Map<string, MutualFundNAV>();
    const lines = data.split('\n');

    for (const line of lines) {
        const parts = line.split(';');
        if (parts.length >= 5 && !isNaN(Number(parts[0]))) {
            const schemeCode = parts[0]?.trim() ?? '';
            const schemeName = parts[3]?.trim() ?? '';
            const navStr = parts[4]?.trim() ?? '';
            const date = parts[5]?.trim() || '';

            const nav = parseFloat(navStr);

            if (!isNaN(nav) && nav > 0) {
                funds.set(schemeCode, {
                    schemeCode,
                    schemeName,
                    nav,
                    date,
                    lastUpdated: Date.now()
                });
            }
        }
    }

    return funds;
}

/**
 * Fetch all mutual fund NAVs from AMFI
 * This returns ALL funds - cache this data as it's a large file
 */
export async function fetchAllMutualFunds(): Promise<Map<string, MutualFundNAV>> {
    try {
        const response = await fetch(AMFI_NAV_URL);

        if (!response.ok) {
            console.error('Failed to fetch AMFI NAV data');
            return new Map();
        }

        const text = await response.text();
        return parseAMFIData(text);
    } catch (error) {
        console.error('Error fetching AMFI data:', error);
        return new Map();
    }
}

/**
 * Fetch NAV for a specific mutual fund by scheme code
 */
export async function fetchMutualFundNAV(schemeCode: string): Promise<MutualFundNAV | null> {
    try {
        const allFunds = await fetchAllMutualFunds();
        return allFunds.get(schemeCode) || null;
    } catch (error) {
        console.error('Error fetching mutual fund NAV:', error);
        return null;
    }
}

/**
 * Search mutual funds by name
 */
export async function searchMutualFunds(query: string): Promise<MutualFundNAV[]> {
    try {
        const allFunds = await fetchAllMutualFunds();
        const searchTerm = query.toLowerCase();

        const results: MutualFundNAV[] = [];

        for (const fund of allFunds.values()) {
            if (fund.schemeName.toLowerCase().includes(searchTerm)) {
                results.push(fund);
                if (results.length >= 20) break; // Limit results
            }
        }

        return results;
    } catch (error) {
        console.error('Error searching mutual funds:', error);
        return [];
    }
}

/**
 * Fetch NAV for multiple funds by scheme codes
 */
export async function fetchMultipleMutualFunds(schemeCodes: string[]): Promise<Map<string, MutualFundNAV>> {
    try {
        const allFunds = await fetchAllMutualFunds();
        const results = new Map<string, MutualFundNAV>();

        for (const code of schemeCodes) {
            const fund = allFunds.get(code);
            if (fund) {
                results.set(code, fund);
            }
        }

        return results;
    } catch (error) {
        console.error('Error fetching multiple mutual funds:', error);
        return new Map();
    }
}

/**
 * Popular Indian Mutual Funds (examples)
 */
export const POPULAR_MUTUAL_FUNDS = [
    { code: '120503', name: 'SBI Bluechip Fund - Direct Plan - Growth' },
    { code: '119551', name: 'HDFC Index Fund-NIFTY 50 Plan - Direct Plan - Growth' },
    { code: '120466', name: 'ICICI Prudential Bluechip Fund - Direct Plan - Growth' },
    { code: '119597', name: 'Axis Bluechip Fund - Direct Plan - Growth' },
    { code: '118989', name: 'Mirae Asset Large Cap Fund - Direct Plan - Growth' },
    { code: '120836', name: 'Parag Parikh Flexi Cap Fund - Direct Plan - Growth' },
    { code: '119552', name: 'UTI Nifty 50 Index Fund - Direct Plan - Growth' },
    { code: '145552', name: 'Nippon India Small Cap Fund - Direct Plan - Growth' },
];

/**
 * Cache manager for AMFI data (recommended to cache for at least 15 minutes)
 */
class MutualFundCache {
    private cache: Map<string, MutualFundNAV> | null = null;
    private lastFetch: number = 0;
    private readonly CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

    async getData(): Promise<Map<string, MutualFundNAV>> {
        const now = Date.now();

        if (!this.cache || (now - this.lastFetch) > this.CACHE_DURATION) {
            this.cache = await fetchAllMutualFunds();
            this.lastFetch = now;
        }

        return this.cache;
    }

    clear() {
        this.cache = null;
        this.lastFetch = 0;
    }
}

export const mutualFundCache = new MutualFundCache();
