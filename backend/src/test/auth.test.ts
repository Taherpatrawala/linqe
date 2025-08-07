import { MikroORM } from '@mikro-orm/core';
import { SqliteDriver } from '@mikro-orm/sqlite';
import { User } from '../entities/User';
import { Post } from '../entities/Post';
import { AuthService } from '../services/AuthService';
import { JWTUtils } from '../utils/jwt';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { beforeEach } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { beforeEach } from 'node:test';
import { describe } from 'node:test';

describe('Authentication System', () => {
    let orm: MikroORM;
    let authService: AuthService;

    beforeAll(async () => {
        // Use SQLite in-memory database for testing
        orm = await MikroORM.init({
            driver: SqliteDriver,
            dbName: ':memory:',
            entities: [User, Post],
            allowGlobalContext: true,
        });

        await orm.getSchemaGenerator().createSchema();
        authService = new AuthService(orm.em.fork());
    });

    afterAll(async () => {
        await orm.close();
    });

    beforeEach(async () => {
        await orm.getSchemaGenerator().clearDatabase();
    });

    describe('User Registration', () => {
        it('should register a new user successfully', async () => {
            const userData = {
                email: 'test@example.com',
                name: 'Test User',
                password: 'password123',
            };

            const result = await authService.register(userData);

            expect(result.user.email).toBe(userData.email);
            expect(result.user.name).toBe(userData.name);
            expect(result.token).toBeDefined();
            expect(result.user).not.toHaveProperty('password');
        });

        it('should reject registration with invalid email', async () => {
            const userData = {
                email: 'invalid-email',
                name: 'Test User',
                password: 'password123',
            };

            await expect(authService.register(userData)).rejects.toThrow('Invalid email format');
        });

        it('should reject registration with short password', async () => {
            const userData = {
                email: 'test@example.com',
                name: 'Test User',
                password: '123',
            };

            await expect(authService.register(userData)).rejects.toThrow('Password must be at least 8 characters long');
        });

        it('should reject registration with existing email', async () => {
            const userData = {
                email: 'test@example.com',
                name: 'Test User',
                password: 'password123',
            };

            await authService.register(userData);
            await expect(authService.register(userData)).rejects.toThrow('User with this email already exists');
        });
    });

    describe('User Login', () => {
        beforeEach(async () => {
            await authService.register({
                email: 'test@example.com',
                name: 'Test User',
                password: 'password123',
            });
        });

        it('should login with correct credentials', async () => {
            const result = await authService.login({
                email: 'test@example.com',
                password: 'password123',
            });

            expect(result.user.email).toBe('test@example.com');
            expect(result.token).toBeDefined();
        });

        it('should reject login with incorrect password', async () => {
            await expect(authService.login({
                email: 'test@example.com',
                password: 'wrongpassword',
            })).rejects.toThrow('Invalid credentials');
        });

        it('should reject login with non-existent email', async () => {
            await expect(authService.login({
                email: 'nonexistent@example.com',
                password: 'password123',
            })).rejects.toThrow('Invalid credentials');
        });
    });

    describe('JWT Token Utilities', () => {
        it('should generate and verify JWT token', () => {
            const user = new User('test@example.com', 'Test User', 'password123');
            user.id = 1;

            const token = JWTUtils.generateToken(user);
            expect(token).toBeDefined();

            const payload = JWTUtils.verifyToken(token);
            expect(payload.userId).toBe(user.id);
            expect(payload.email).toBe(user.email);
        });

        it('should reject invalid token', () => {
            expect(() => JWTUtils.verifyToken('invalid-token')).toThrow('Invalid or expired token');
        });

        it('should extract token from Authorization header', () => {
            const token = 'test-token';
            const authHeader = `Bearer ${token}`;

            const extractedToken = JWTUtils.extractTokenFromHeader(authHeader);
            expect(extractedToken).toBe(token);
        });

        it('should return null for invalid Authorization header', () => {
            expect(JWTUtils.extractTokenFromHeader('Invalid header')).toBeNull();
            expect(JWTUtils.extractTokenFromHeader(undefined)).toBeNull();
        });
    });

    describe('User Entity', () => {
        it('should hash password before saving', async () => {
            const user = new User('test@example.com', 'Test User', 'password123');
            await user.hashPassword();

            expect(user.password).not.toBe('password123');
            expect(user.password.startsWith('$2b$')).toBe(true);
        });

        it('should verify password correctly', async () => {
            const user = new User('test@example.com', 'Test User', 'password123');
            await user.hashPassword();

            const isValid = await user.verifyPassword('password123');
            expect(isValid).toBe(true);

            const isInvalid = await user.verifyPassword('wrongpassword');
            expect(isInvalid).toBe(false);
        });

        it('should validate email format', () => {
            expect(User.isValidEmail('test@example.com')).toBe(true);
            expect(User.isValidEmail('invalid-email')).toBe(false);
        });

        it('should validate password length', () => {
            expect(User.isValidPassword('password123')).toBe(true);
            expect(User.isValidPassword('short')).toBe(false);
        });

        it('should exclude password from JSON serialization', () => {
            const user = new User('test@example.com', 'Test User', 'password123');
            user.id = 1;

            const json = user.toJSON();
            expect(json).not.toHaveProperty('password');
            expect(json.email).toBe('test@example.com');
        });
    });
});