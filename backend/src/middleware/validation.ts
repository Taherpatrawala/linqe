import { Request, Response, NextFunction } from 'express';
import { z, ZodError, ZodSchema } from 'zod';
import { ValidationError } from '../types/errors';

/**
 * Validation schemas for different endpoints
 */
export const validationSchemas = {
    // Authentication schemas
    register: z.object({
        body: z.object({
            email: z.string().email('Invalid email format'),
            name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
            password: z.string().min(8, 'Password must be at least 8 characters long'),
            bio: z.string().max(500, 'Bio must be 500 characters or less').optional()
        })
    }),

    login: z.object({
        body: z.object({
            email: z.string().email('Invalid email format'),
            password: z.string().min(1, 'Password is required')
        })
    }),

    // User profile schemas
    updateProfile: z.object({
        body: z.object({
            name: z.string().min(1, 'Name cannot be empty').max(100, 'Name must be 100 characters or less').optional(),
            bio: z.string().max(500, 'Bio must be 500 characters or less').optional()
        })

    }),

    getUserProfile: z.object({
        params: z.object({
            id: z.string().regex(/^\d+$/, 'Invalid user ID').transform(Number)
        })
    }),

    // Post schemas
    createPost: z.object({
        body: z.object({
            content: z.string()
                .min(1, 'Post content cannot be empty')
                .max(1000, 'Post content must be 1000 characters or less')
        })
    }),

    getPostById: z.object({
        params: z.object({
            id: z.string().regex(/^\d+$/, 'Invalid post ID').transform(Number)
        })
    }),

    getUserPosts: z.object({
        params: z.object({
            userId: z.string().regex(/^\d+$/, 'Invalid user ID').transform(Number)
        }),
        query: z.object({
            limit: z.string().regex(/^\d+$/).transform(Number).refine(n => n >= 1 && n <= 100, 'Limit must be between 1 and 100').optional(),
            offset: z.string().regex(/^\d+$/).transform(Number).refine(n => n >= 0, 'Offset must be non-negative').optional()
        })
    }),

    getAllPosts: z.object({
        query: z.object({
            limit: z.string().regex(/^\d+$/).transform(Number).refine(n => n >= 1 && n <= 100, 'Limit must be between 1 and 100').optional(),
            offset: z.string().regex(/^\d+$/).transform(Number).refine(n => n >= 0, 'Offset must be non-negative').optional()
        })
    })
};

/**
 * Generic validation middleware factory
 */
export const validate = (schema: ZodSchema) => {
    return (req: Request, _res: Response, next: NextFunction): void => {
        try {
            // Validate the request against the schema
            const validationData = {
                body: req.body,
                params: req.params,
                query: req.query
            };

            const result = schema.parse(validationData);

            // Replace request data with validated and transformed data
            if (result.body) req.body = result.body;
            if (result.params) req.params = result.params;
            if (result.query) req.query = result.query;

            next();
        } catch (error) {
            if (error instanceof ZodError) {
                // Transform Zod errors into our ValidationError format
                const validationErrors = error.errors.map(err => ({
                    field: err.path.join('.'),
                    message: err.message,
                    value: 'input' in err ? err.input : undefined
                }));

                const validationError = new ValidationError(
                    'Validation failed',
                    validationErrors
                );

                next(validationError);
            } else {
                next(error);
            }
        }
    };
};

/**
 * Sanitization middleware for string inputs
 */
export const sanitizeStrings = (req: Request, _res: Response, next: NextFunction): void => {
    const sanitizeObject = (obj: any): any => {
        if (typeof obj === 'string') {
            return obj.trim().replace(/\s+/g, ' ');
        }

        if (Array.isArray(obj)) {
            return obj.map(sanitizeObject);
        }

        if (obj && typeof obj === 'object') {
            const sanitized: any = {};
            for (const [key, value] of Object.entries(obj)) {
                sanitized[key] = sanitizeObject(value);
            }
            return sanitized;
        }

        return obj;
    };

    if (req.body) {
        req.body = sanitizeObject(req.body);
    }

    next();
};

/**
 * Request size validation middleware
 */
export const validateRequestSize = (maxSizeKB: number = 1024) => {
    return (req: Request, _res: Response, next: NextFunction): void => {
        const contentLength = parseInt(req.headers['content-length'] || '0');
        const maxSizeBytes = maxSizeKB * 1024;

        if (contentLength > maxSizeBytes) {
            const error = new ValidationError(
                `Request body too large. Maximum size is ${maxSizeKB}KB`,
                { maxSize: maxSizeKB, actualSize: Math.round(contentLength / 1024) }
            );
            next(error);
            return;
        }

        next();
    };
};