// Validate email
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Validate phone (Indian)
export function isValidPhone(phone: string): boolean {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone.replace(/\D/g, ''));
}

// Validate PAN
export function isValidPAN(pan: string): boolean {
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return panRegex.test(pan.toUpperCase());
}

// Validate positive number
export function isPositiveNumber(value: number): boolean {
    return typeof value === 'number' && value > 0 && isFinite(value);
}

// Validate date in future
export function isFutureDate(timestamp: number): boolean {
    return timestamp > Date.now();
}

// Validate date range
export function isValidDateRange(start: number, end: number): boolean {
    return start < end;
}

// Validate required string
export function isNotEmpty(value: string): boolean {
    return typeof value === 'string' && value.trim().length > 0;
}

// Validate min length
export function hasMinLength(value: string, min: number): boolean {
    return value.length >= min;
}

// Validate max length
export function hasMaxLength(value: string, max: number): boolean {
    return value.length <= max;
}
