// SMS-based CAS Request Service
// Provides SMS templates and automated request helpers for CAMS/KFintech

export interface SMSRequest {
    number: string;
    message: string;
    service: 'CAMS' | 'KFINTECH';
}

/**
 * CAMS SMS Service
 * Send SMS to: 9741979419 or 5676791 or 5676782
 * Format: CAMS <space> <PAN>
 */
export function getCAMSSMSRequest(pan: string): SMSRequest {
    return {
        number: '9741979419',
        message: `CAMS ${pan.toUpperCase()}`,
        service: 'CAMS'
    };
}

/**
 * KFintech SMS Service  
 * Send SMS to: 9640099440
 * Format: STATUSUNITS <space> <PAN>
 */
export function getKFintechSMSRequest(pan: string): SMSRequest {
    return {
        number: '9640099440',
        message: `STATUSUNITS ${pan.toUpperCase()}`,
        service: 'KFINTECH'
    };
}

/**
 * Open SMS app with pre-filled message (mobile devices)
 */
export function openSMSApp(request: SMSRequest): boolean {
    const smsUrl = `sms:${request.number}?body=${encodeURIComponent(request.message)}`;

    // Try to open SMS app
    const link = document.createElement('a');
    link.href = smsUrl;
    link.click();

    return true;
}

/**
 * Open CAMS website for CAS request
 */
export function openCAMSWebsite(): void {
    window.open('https://www.camsonline.com/Investors/Statements/Consolidated-Account-Statement', '_blank');
}

/**
 * Open KFintech website for CAS request
 */
export function openKFintechWebsite(): void {
    window.open('https://www.kfintech.com/KFintech_Investor_Services.html', '_blank');
}

/**
 * Detect if user is on mobile device
 */
export function isMobileDevice(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Get user-friendly instructions based on device
 */
export function getCASInstructions(): {
    title: string;
    steps: string[];
    canUseSMS: boolean;
} {
    const isMobile = isMobileDevice();

    if (isMobile) {
        return {
            title: 'Request CAS via SMS (Quick & Easy)',
            steps: [
                'Enter your PAN number below',
                'Click "Send SMS to CAMS" or "Send SMS to KFintech"',
                'Your SMS app will open with a pre-filled message',
                'Send the SMS to request your CAS',
                'You will receive CAS via email within 30 minutes',
                'Upload the CAS file using the Import button'
            ],
            canUseSMS: true
        };
    }

    return {
        title: 'Request CAS Online',
        steps: [
            'Click "Open CAMS Website" or "Open KFintech Website"',
            'Enter your PAN and registered email/mobile',
            'Request "Detailed" Consolidated Account Statement',
            'You will receive it via email within 30 minutes',
            'Download and upload the CAS file here'
        ],
        canUseSMS: false
    };
}
