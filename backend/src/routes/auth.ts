import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { AuthService } from '../services/AuthService';
import { authenticateToken } from '../middleware/auth';
import { validate, validationSchemas } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';

export function createAuthRoutes(authService: AuthService): Router {
    const router = Router();
    const authController = new AuthController(authService);

    // Public routes
    router.post('/register', validate(validationSchemas.register), asyncHandler(authController.register));
    router.post('/login', validate(validationSchemas.login), asyncHandler(authController.login));
    router.post('/logout', asyncHandler(authController.logout));

    // Protected routes
    router.get('/me', authenticateToken, asyncHandler(authController.me));

    return router;
}