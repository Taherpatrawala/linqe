import { Request, Response, NextFunction } from 'express';
import { MikroORM } from '@mikro-orm/core';
import { User } from '../entities/User';
import { JWTUtils } from '../utils/jwt';
import { AuthenticationError, DatabaseError } from '../types/errors';

// Extend Express Request interface to include user
declare global {
    namespace Express {
        interface Request {
            user?: User;
            orm?: MikroORM;
        }
    }
}

/**
 * Authentication middleware to protect routes
 */
export const authenticateToken = async (
    req: Request,
    _res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const token = JWTUtils.extractTokenFromHeader(req.headers.authorization);

        if (!token) {
            throw new AuthenticationError('Access token required');
        }

        const payload = JWTUtils.verifyToken(token);

        // Get user from database
        if (!req.orm) {
            throw new DatabaseError('Database connection not available');
        }

        const em = req.orm.em.fork();
        const user = await em.findOne(User, { id: payload.userId });

        if (!user) {
            throw new AuthenticationError('User not found');
        }

        req.user = user;
        next();
    } catch (error) {
        if (error instanceof AuthenticationError || error instanceof DatabaseError) {
            next(error);
        } else {
            next(new AuthenticationError('Invalid or expired token'));
        }
    }
};

/**
 * Optional authentication middleware - doesn't fail if no token provided
 */
export const optionalAuth = async (
    req: Request,
    _res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const token = JWTUtils.extractTokenFromHeader(req.headers.authorization);

        if (token && req.orm) {
            const payload = JWTUtils.verifyToken(token);
            const em = req.orm.em.fork();
            const user = await em.findOne(User, { id: payload.userId });

            if (user) {
                req.user = user;
            }
        }
    } catch (error) {
        // Ignore errors in optional auth
    }

    next();
};