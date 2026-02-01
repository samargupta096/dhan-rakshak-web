// CAMS CAS Statement Parser
// Parses Consolidated Account Statement from CAMS to import mutual fund holdings

export interface CASMutualFund {
    folioNumber: string;
    schemeName: string;
    amcName: string;
    registrar: string;
    units: number;
    nav: number;
    currentValue: number;
    costValue?: number;
}

export interface CASParseResult {
    pan: string;
    name: string;
    email: string;
    mobile: string;
    mutualFunds: CASMutualFund[];
    generatedDate: string;
}

/**
 * Parse CAMS CAS statement (text format)
 * CAMS sends CAS via email in text/PDF format
 */
export function parseCASTxt(casText: string): CASParseResult {
    const result: CASParseResult = {
        pan: '',
        name: '',
        email: '',
        mobile: '',
        mutualFunds: [],
        generatedDate: ''
    };

    const lines = casText.split('\n');

    // Extract personal details
    for (const line of lines) {
        if (line.includes('PAN:')) {
            result.pan = line.split('PAN:')[1]?.trim() || '';
        }
        if (line.includes('Name:')) {
            result.name = line.split('Name:')[1]?.trim() || '';
        }
        if (line.includes('Email:')) {
            result.email = line.split('Email:')[1]?.trim() || '';
        }
        if (line.includes('Mobile:')) {
            result.mobile = line.split('Mobile:')[1]?.trim() || '';
        }
    }

    // Parse mutual fund holdings
    // Format: AMC Name | Scheme Name | Folio | Units | NAV | Current Value
    let currentAMC = '';

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i]?.trim() ?? '';

        // Detect AMC section headers
        if (line.match(/^[A-Z\s&]+MUTUAL FUND$/)) {
            currentAMC = line.replace('MUTUAL FUND', '').trim();
            continue;
        }

        // Parse folio lines (contains Folio No:)
        if (line.includes('Folio No:')) {
            const folioMatch = line.match(/Folio No:\s*(\S+)/);
            const folio = folioMatch ? folioMatch[1] : '';

            // Next line usually has scheme name
            const schemeName = lines[i + 1]?.trim() || '';

            // Look for units and NAV in following lines
            for (let j = i + 2; j < Math.min(i + 10, lines.length); j++) {
                const dataLine = lines[j];

                // Match pattern: Units | NAV | Value
                const match = dataLine?.match(/(\d+\.?\d*)\s+(\d+\.?\d*)\s+(\d+\.?\d*)/);
                if (match) {
                    const units = parseFloat(match[1] ?? '0');
                    const nav = parseFloat(match[2] ?? '0');
                    const value = parseFloat(match[3] ?? '0');

                    if (units > 0 && nav > 0) {
                        result.mutualFunds.push({
                            folioNumber: folio ?? '',
                            schemeName,
                            amcName: currentAMC,
                            registrar: 'CAMS',
                            units,
                            nav,
                            currentValue: value,
                            costValue: undefined
                        });
                        break;
                    }
                }
            }
        }
    }

    return result;
}

/**
 * Parse uploaded CAS file
 */
export async function parseUploadedCAS(file: File): Promise<CASParseResult> {
    const text = await file.text();
    return parseCASTxt(text);
}

/**
 * Instructions for getting CAS statement
 */
export const CAS_INSTRUCTIONS = {
    cams: {
        name: 'CAMS',
        email: 'camsonline.com',
        steps: [
            'Go to https://www.camsonline.com',
            'Click on "Investor Services" > "Statement of Account"',
            'Enter your PAN and registered email/mobile',
            'Select "Detailed" statement',
            'You will receive CAS via email'
        ]
    },
    karvy: {
        name: 'KFintech (formerly Karvy)',
        email: 'kfintech.com',
        steps: [
            'Go to https://www.kfintech.com',
            'Click on "Investor Services" > "CAS"',
            'Enter your PAN and contact details',
            'Request detailed statement',
            'You will receive CAS via email'
        ]
    }
};
