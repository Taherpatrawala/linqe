import request from 'supertest';
import express from 'express';
import { errorHandler, notFoundHandler } from '../middleware/errorHandler';
import { ValidationError, AuthenticationError, NotFoundError } from '../types/errors';

describe('Error Handling Middleware', () => {
    let app: express.Application;

    beforeEach(() => {
        app = express();
        app.use(express.json());

        // Test routes that throw different types of errors
        app.get('/validation-error', () => {
            throw new ValidationError('Invalid input data', { field: 'email', message: 'Invalid format' });
        });

        app.get('/auth-error', () => {
            throw new AuthenticationError('Access denied');
        });

        app.get('/not-found-error', () => {
            throw new NotFoundError('Resource not found');
        });

        app.get('/generic-error', () => {
            throw new Error('Something went wrong');
        });

        // Add error handlers
        app.use('*', notFoundHandler);
        app.use(errorHandler);
    });

    describe('Validation Error Handling', () => {
        it('should return 400 for validation errors with details', async () => {
            const response = await request(app)
                .get('/validation-error')
                .expect(400);

            expect(response.body.error).toBeDefined();
            expect(response.body.error.message).toBe('Invalid input data');
            expect(response.body.error.code).toBe('VALIDATION_ERROR');
            expect(response.body.error.details).toBeDefined();
            expect(response.body.error.timestamp).toBeDefined();
        });
    });

    describe('Authentication Error Handling', () => {
        it('should return 401 for authentication errors', async () => {
            const response = await request(app)
                .get('/auth-error')
                .expect(401);

            expect(response.body.error).toBeDefined();
            expect(response.body.error.message).toBe('Access denied');
            expect(response.body.error.code).toBe('AUTHENTICATION_ERROR');
        });
    });

    describe('Not Found Error Handling', () => {
        it('should return 404 for not found errors', async () => {
            const response = await request(app)
                .get('/not-found-error')
                .expect(404);

            expect(response.body.error).toBeDefined();
            expect(response.body.error.message).toBe('Resource not found');
            expect(response.body.error.code).toBe('NOT_FOUND');
        });
    });

    describe('Generic Error Handling', () => {
        it('should return 500 for generic errors', async () => {
            const response = await request(app)
                .get('/generic-error')
                .expect(500);

            expect(response.body.error).toBeDefined();
            // In test environment, shows generic message for security
            expect(response.body.error.message).toBe('Internal server error');
            expect(response.body.error.code).toBe('INTERNAL_ERROR');
        });
    });

    describe('404 Handler', () => {
        it('should return 404 for non-existent routes', async () => {
            const response = await request(app)
                .get('/non-existent-route')
                .expect(404);

            expect(response.body.error).toBeDefined();
            expect(response.body.error.message).toContain('Route GET');
            expect(response.body.error.message).toContain('not found');
            expect(response.body.error.code).toBe('NOT_FOUND');
        });
    });
});