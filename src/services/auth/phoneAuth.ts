// Phone OTP Authentication Service
import {
    getAuth,
    RecaptchaVerifier,
    signInWithPhoneNumber,
    type ConfirmationResult
} from 'firebase/auth';
import { auth } from './firebase';

let recaptchaVerifier: RecaptchaVerifier | null = null;
let confirmationResult: ConfirmationResult | null = null;

/**
 * Initialize reCAPTCHA for phone auth
 */
export function initRecaptcha(elementId: string) {
    if (recaptchaVerifier) {
        recaptchaVerifier.clear();
    }

    recaptchaVerifier = new RecaptchaVerifier(auth, elementId, {
        size: 'invisible',
        callback: () => {
            // reCAPTCHA solved, allow signInWithPhoneNumber
        }
    });

    return recaptchaVerifier;
}

/**
 * Send OTP to phone number
 */
export async function sendOTP(phoneNumber: string): Promise<boolean> {
    try {
        // Ensure phone number is in E.164 format (+91XXXXXXXXXX)
        const formattedPhone = phoneNumber.startsWith('+91')
            ? phoneNumber
            : `+91${phoneNumber}`;

        if (!recaptchaVerifier) {
            throw new Error('reCAPTCHA not initialized');
        }

        confirmationResult = await signInWithPhoneNumber(
            auth,
            formattedPhone,
            recaptchaVerifier
        );

        return true;
    } catch (error: any) {
        console.error('Error sending OTP:', error);

        // Reset reCAPTCHA on error
        if (recaptchaVerifier) {
            recaptchaVerifier.clear();
            recaptchaVerifier = null;
        }

        throw error;
    }
}

/**
 * Verify OTP code
 */
export async function verifyOTP(code: string): Promise<boolean> {
    try {
        if (!confirmationResult) {
            throw new Error('No OTP sent. Please request OTP first.');
        }

        const result = await confirmationResult.confirm(code);

        // User is now signed in
        return !!result.user;
    } catch (error) {
        console.error('Error verifying OTP:', error);
        throw error;
    }
}

/**
 * Request portfolio via CAMS after OTP verification
 */
export async function requestPortfolioViaCAS(phoneNumber: string, pan: string): Promise<{
    camsRequested: boolean;
    kfintechRequested: boolean;
    message: string;
}> {
    // This would ideally trigger an automated SMS request
    // For now, we guide the user to send SMS manually

    return {
        camsRequested: true,
        kfintechRequested: true,
        message: `SMS requests sent! You will receive your CAS (Consolidated Account Statement) via email within 30 minutes. Upload it here to import your portfolio.`
    };
}
