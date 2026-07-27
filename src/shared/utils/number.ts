
/**
 * Formats a phone number into Colombian format +57 (XXX) XXX-XXXX.
 *
 * Cleans non-digits, strips leading "57" if present (legacy data with country code),
 * and formats the 10-digit Colombian number.
 *
 * @param {string} phoneNumber - Raw phone number string (digits or masked).
 * @returns {string} - Formatted as "+57 (XXX) XXX-XXXX" or partial while typing.
 *
 * @example
 * maskFormatPhoneNumber('3001234567');      // returns '+57 (300) 123-4567'
 * maskFormatPhoneNumber('573001234567');    // returns '+57 (300) 123-4567'
 * maskFormatPhoneNumber('300');             // returns '+57 (300'
 * maskFormatPhoneNumber('');                // returns '+57 ('
 */
export const maskFormatPhoneNumber = (phoneNumber: string): string => {
    let cleaned = phoneNumber.replace(/\D/g, '');

    if (cleaned.length === 0) return '+57 (';

    // Si empieza con "57" y tiene más de 10 dígitos, eliminar el prefijo
    // (compatible con datos legacy que incluyen código de país)
    if (cleaned.startsWith('57') && cleaned.length > 10) {
        cleaned = cleaned.slice(2);
    }

    const prefix = '+57 (';
    const digits = cleaned.slice(0, 10);

    if (digits.length <= 3) {
        return `${prefix}${digits}`;
    }

    if (digits.length <= 6) {
        return `${prefix}${digits.slice(0, 3)}) ${digits.slice(3)}`;
    }

    return `${prefix}${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
};

/**
 * Strips all non-digit characters from a phone number, returning only digits.
 * Useful for sending normalized data to the API.
 *
 * @param {string} phoneNumber - The phone number string (masked or raw).
 * @returns {string} - Only digits, e.g. "573001234567".
 *
 * @example
 * unmaskPhoneNumber('+57 (300) 123-4567'); // returns '573001234567'
 */
export const unmaskPhoneNumber = (phoneNumber: string): string => {
    return phoneNumber.replace(/\D/g, '');
};

/**
 * Formats a string and converts it to a number.
 *
 * The function removes spaces, dollar signs ($), and periods (.) from the input string
 * before converting it to a floating-point number using `parseFloat`.
 *
 * @param {string} chain - The string to format and convert.
 * @returns {number} - The formatted and converted number.
 *
 * @example
 * formatAndConvertToNumber('123.45'); // returns 123.45
 * formatAndConvertToNumber('$1,234.56'); // returns 1234.56
 * formatAndConvertToNumber('123 456'); // returns 123456
 * formatAndConvertToNumber(' '); // returns 0
 */
export function formatAndConvertToNumber(chain: any): number {
    try {
        if (chain && chain.length == 0) {
            return 0;
        }
        if (Number.isInteger(chain)) {
            return chain;
        }
        const formatChain = chain.replace(/[\s$.]/g, '');
        const numero = Number.parseFloat(formatChain);

        return numero;
    } catch (e) {
        return 0;
    }
}

export const calculatePercentage = (value: number, total: number): any => {
    if (total === 0) {
        return 0;
    }

    return ((value / total) * 100).toFixed(2);
};

export const calculateValueFromPercentage = (percentage: number, totalValue: number): number => {
    return (percentage / 100) * totalValue;
};

/**
 * Generates a unique ID string based on the current time.
 *
 * This function creates a unique identifier by combining the current timestamp
 * with a random number to ensure uniqueness.
 *
 * @returns {string} - The generated unique ID.
 *
 * @example
 * generateUniqueId(); // returns '1633024800000-1234567890'
 */
export const generateUniqueId = (): string => {
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 1e2);
    return `${timestamp}-${randomNum}`;
};