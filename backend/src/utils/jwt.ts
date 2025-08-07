import jwt, { SignOptions } from 'jsonwebtoken';
import { User } from '../entities/User';
import { config } from '../config/environment';

export interface JWTPayload {
    userId: number;
    email: string;
    iat?: number;
    exp?: number;
}

export class JWTUtils {
    private static readonly JWT_SECRET: string = config.jwt.secret;
    // private static readonly JWT_EXPIRES_IN: string = config.jwt.expiresIn;

    /**
     * Generate JWT token for user
     */
    static generateToken(user: User): string {
        const payload: JWTPayload = {
            userId: user.id,
            email: user.email,
        };

        const options: SignOptions = {
            expiresIn: "1d",
        };

        return jwt.sign(payload, this.JWT_SECRET, options);
    }

    /**
     * Verify and decode JWT token
     */
    static verifyToken(token: string): JWTPayload {
        try {
            return jwt.verify(token, this.JWT_SECRET) as JWTPayload;
        } catch (error) {
            throw new Error('Invalid or expired token');
        }
    }

    /**
     * Extract token from Authorization header
     */
    static extractTokenFromHeader(authHeader: string | undefined): string | null {
        if (!authHeader) {
            return null;
        }

        const parts = authHeader.split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            return null;
        }

        return parts[1] || null;
    }
}