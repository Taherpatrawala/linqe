import { User, Post } from '../entities';

/**
 * Validation utility functions
 */
export class ValidationUtils {
    /**
     * Validate user registration data
     */
    static validateUserRegistration(data: {
        email: string;
        name: string;
        password: string;
        bio?: string;
    }): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];

        // Validate email
        if (!data.email || !User.isValidEmail(data.email)) {
            errors.push('Invalid email format');
        }

        // Validate name
        if (!data.name || data.name.trim().length === 0) {
            errors.push('Name is required');
        }

        // Validate password
        if (!data.password || !User.isValidPassword(data.password)) {
            errors.push('Password must be at least 8 characters long');
        }

        // Validate bio if provided
        if (data.bio && !User.isValidBio(data.bio)) {
            errors.push('Bio must be 500 characters or less');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Validate user profile update data
     */
    static validateUserProfileUpdate(data: {
        name?: string;
        bio?: string;
    }): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];

        // Validate name if provided
        if (data.name !== undefined && data.name.trim().length === 0) {
            errors.push('Name cannot be empty');
        }

        // Validate bio if provided
        if (data.bio !== undefined && !User.isValidBio(data.bio)) {
            errors.push('Bio must be 500 characters or less');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Validate post creation data
     */
    static validatePostCreation(data: {
        content: string;
    }): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];

        // Validate content
        if (!data.content || !Post.isValidContent(data.content)) {
            errors.push('Post content must be between 1 and 1000 characters');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Sanitize string input
     */
    static sanitizeString(input: string): string {
        return input.trim().replace(/\s+/g, ' ');
    }

    /**
     * Check if string is empty or only whitespace
     */
    static isEmpty(input: string): boolean {
        return !input || input.trim().length === 0;
    }
}