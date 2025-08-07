import Cookies from 'js-cookie';

const TOKEN_COOKIE_NAME = 'auth_token';

export class CookieUtils {
    /**
     * Set authentication token in cookie
     */
    static setToken(token: string): void {
        Cookies.set(TOKEN_COOKIE_NAME, token, {
            expires: 7, // 7 days
            secure: process.env.NODE_ENV === 'production', // Only use secure in production (HTTPS)
            sameSite: 'strict', // CSRF protection - strict same-site policy
            path: '/', // Available across the entire site
            // Note: httpOnly is not set because we need JavaScript access
            // In a production app, consider using httpOnly cookies with a separate CSRF token
        });
    }

    /**
     * Get authentication token from cookie
     */
    static getToken(): string | undefined {
        return Cookies.get(TOKEN_COOKIE_NAME);
    }

    /**
     * Remove authentication token from cookie
     */
    static removeToken(): void {
        Cookies.remove(TOKEN_COOKIE_NAME, {
            path: '/', // Must match the path used when setting
        });
    }

    /**
     * Check if token exists
     */
    static hasToken(): boolean {
        return !!Cookies.get(TOKEN_COOKIE_NAME);
    }

    /**
     * Set theme preference in cookie
     */
    static setTheme(theme: string): void {
        Cookies.set('theme', theme, {
            expires: 365, // 1 year
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
        });
    }

    /**
     * Get theme preference from cookie
     */
    static getTheme(): string | undefined {
        return Cookies.get('theme');
    }

    /**
     * Remove theme preference from cookie
     */
    static removeTheme(): void {
        Cookies.remove('theme', { path: '/' });
    }

    /**
     * Clear all auth-related cookies (useful for complete logout)
     */
    static clearAllAuthCookies(): void {
        // Remove the main auth token
        this.removeToken();

        // Remove any other auth-related cookies if they exist
        // This is future-proofing for additional auth cookies
        const authCookieNames = ['auth_token', 'refresh_token', 'user_session'];
        authCookieNames.forEach(cookieName => {
            Cookies.remove(cookieName, { path: '/' });
        });
    }
}