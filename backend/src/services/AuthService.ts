import { EntityManager } from '@mikro-orm/core';
import { User } from '../entities/User';
import { JWTUtils } from '../utils/jwt';

export interface RegisterData {
    email: string;
    name: string;
    password: string;
    bio?: string;
}

export interface LoginData {
    email: string;
    password: string;
}

export interface AuthResponse {
    user: {
        id: number;
        email: string;
        name: string;
        bio: string | undefined;
        createdAt: Date;
    };
    token: string;
}

export class AuthService {
    constructor(private em: EntityManager) { }

    /**
     * Register a new user
     */
    async register(data: RegisterData): Promise<AuthResponse> {
        const { email, name, password } = data;

        // Validate input
        if (!User.isValidEmail(email)) {
            throw new Error('Invalid email format');
        }

        if (!User.isValidPassword(password)) {
            throw new Error('Password must be at least 8 characters long');
        }

        if (!name.trim()) {
            throw new Error('Name is required');
        }

        // Check if user already exists
        const existingUser = await this.em.findOne(User, { email });
        if (existingUser) {
            throw new Error('User with this email already exists');
        }

        // Create new user
        const user = new User(email, name.trim(), password);
        await this.em.persistAndFlush(user);

        // Generate token
        const token = JWTUtils.generateToken(user);

        return {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                bio: user.bio,
                createdAt: user.createdAt,
            },
            token,
        };
    }

    /**
     * Login user with credentials
     */
    async login(data: LoginData): Promise<AuthResponse> {
        const { email, password } = data;

        // Validate input
        if (!email || !password) {
            throw new Error('Email and password are required');
        }

        // Find user by email
        const user = await this.em.findOne(User, { email });
        if (!user) {
            throw new Error('Invalid credentials');
        }

        // Verify password
        const isValidPassword = await user.verifyPassword(password);
        if (!isValidPassword) {
            throw new Error('Invalid credentials');
        }

        // Generate token
        const token = JWTUtils.generateToken(user);

        return {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                bio: user.bio,
                createdAt: user.createdAt,
            },
            token,
        };
    }

    /**
     * Get current user by ID
     */
    async getCurrentUser(userId: number): Promise<User | null> {
        return await this.em.findOne(User, { id: userId });
    }
}