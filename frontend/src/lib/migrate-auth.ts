import { CookieUtils } from './cookie-utils';

/**
 * Migrate authentication token from localStorage to cookies
 * This is a one-time migration for existing users
 */
export function migrateAuthFromLocalStorage(): void {
    if (typeof window === 'undefined') {
        return; // Skip on server side
    }

    try {
        // Check if we already have a token in cookies
        if (CookieUtils.hasToken()) {
            // Clean up any old localStorage token
            localStorage.removeItem('auth_token');
            return;
        }

        // Check for existing localStorage token
        const localStorageToken = localStorage.getItem('auth_token');
        if (localStorageToken) {
            // Migrate to cookies
            CookieUtils.setToken(localStorageToken);

            // Remove from localStorage
            localStorage.removeItem('auth_token');

            console.log('Successfully migrated auth token from localStorage to cookies');
        }
    } catch (error) {
        console.warn('Failed to migrate auth token:', error);
    }
}