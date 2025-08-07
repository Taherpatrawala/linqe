import { Request, Response } from 'express';
import { AuthService, RegisterData, LoginData } from '../services/AuthService';
import { AuthenticationError, ConflictError, ValidationError } from '../types/errors';

export class AuthController {
    constructor(private authService: AuthService) { }

    /**
     * Register a new user
     */
    register = async (req: Request, res: Response): Promise<void> => {
        const { email, name, password, bio }: RegisterData = req.body;

        try {
            const registerData: RegisterData = { email, name, password };
            if (bio !== undefined) {
                registerData.bio = bio;
            }
            const result = await this.authService.register(registerData);
            res.status(201).json(result);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Registration failed';

            if (message.includes('already exists')) {
                throw new ConflictError('User with this email already exists');
            } else if (message.includes('Invalid email')) {
                throw new ValidationError('Invalid email format');
            } else if (message.includes('Password must be')) {
                throw new ValidationError('Password must be at least 8 characters long');
            } else if (message.includes('Bio')) {
                throw new ValidationError('Bio must be 500 characters or less');
            }

            // Re-throw the original error if it doesn't match known patterns
            throw error;
        }
    };

    /**
     * Login user
     */
    login = async (req: Request, res: Response): Promise<void> => {
        const { email, password }: LoginData = req.body;

        try {
            const result = await this.authService.login({ email, password });
            res.status(200).json(result);
        } catch (error) {
            throw new AuthenticationError('Invalid email or password');
        }
    };

    /**
     * Get current user information
     */
    me = async (req: Request, res: Response): Promise<void> => {
        if (!req.user) {
            throw new AuthenticationError('User not authenticated');
        }

        res.status(200).json({

            id: req.user.id,
            email: req.user.email,
            name: req.user.name,
            bio: req.user.bio,
            createdAt: req.user.createdAt,

        });
    };

    /**
     * Logout user (client-side token removal)
     */
    logout = async (_req: Request, res: Response): Promise<void> => {
        // Since we're using JWT tokens, logout is handled client-side
        // by removing the token from storage
        res.status(200).json({
            message: 'Logged out successfully'
        });
    };
}