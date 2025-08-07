import request from 'supertest';
import { MikroORM } from '@mikro-orm/core';
import { SqliteDriver } from '@mikro-orm/sqlite';
import express from 'express';
import { User } from '../entities/User';
import { Post } from '../entities/Post';
import { AuthService } from '../services/AuthService';
import { createAuthRoutes } from '../routes/auth';
import { injectORM } from '../middleware/orm';

describe('Authentication Endpoints', () => {
    let orm: MikroORM;
    let app: express.Application;

    beforeAll(async () => {
        // Use SQLite in-memory database for testing
        orm = await MikroORM.init({
            driver: SqliteDriver,
            dbName: ':memory:',
            entities: [User, Post],
            allowGlobalContext: true,
        });

        await orm.getSchemaGenerator().createSchema();

        // Create Express app
        app = express();
        app.use(express.json());
        app.use(injectORM(orm));

        // Create services and routes
        const authService = new AuthService(orm.em.fork());
        app.use('/api/auth', createAuthRoutes(authService));
    });

    afterAll(async () => {
        await orm.close();
    });

    beforeEach(async () => {
        await orm.getSchemaGenerator().clearDatabase();
    });

    describe('POST /api/auth/register', () => {
        it('should register a new user successfully', async () => {
            const userData = {
                email: 'test@example.com',
                name: 'Test User',
                password: 'password123',
            };

            const response = await request(app)
                .post('/api/auth/register')
                .send(userData)
                .expect(201);

            expect(response.body.user.email).toBe(userData.email);
            expect(response.body.user.name).toBe(userData.name);
            expect(response.body.token).toBeDefined();
            expect(response.body.user).not.toHaveProperty('password');
        });

        it('should reject registration with invalid email', async () => {
            const userData = {
                email: 'invalid-email',
                name: 'Test User',
                password: 'password123',
            };

            const response = await request(app)
                .post('/api/auth/register')
                .send(userData)
                .expect(400);

            expect(response.body.error.message).toContain('Invalid email format');
        });

        it('should reject registration with short password', async () => {
            const userData = {
                email: 'test@example.com',
                name: 'Test User',
                password: '123',
            };

            const response = await request(app)
                .post('/api/auth/register')
                .send(userData)
                .expect(400);

            expect(response.body.error.message).toContain('Password must be at least 8 characters long');
        });

        it('should reject registration with existing email', async () => {
            const userData = {
                email: 'test@example.com',
                name: 'Test User',
                password: 'password123',
            };

            // Register first user
            await request(app)
                .post('/api/auth/register')
                .send(userData)
                .expect(201);

            // Try to register with same email
            const response = await request(app)
                .post('/api/auth/register')
                .send(userData)
                .expect(409);

            expect(response.body.error.message).toContain('already exists');
        });
    });

    describe('POST /api/auth/login', () => {
        beforeEach(async () => {
            // Register a user for login tests
            await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'test@example.com',
                    name: 'Test User',
                    password: 'password123',
                });
        });

        it('should login with correct credentials', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'password123',
                })
                .expect(200);

            expect(response.body.user.email).toBe('test@example.com');
            expect(response.body.token).toBeDefined();
        });

        it('should reject login with incorrect password', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'wrongpassword',
                })
                .expect(401);

            expect(response.body.error.message).toContain('Invalid credentials');
        });

        it('should reject login with non-existent email', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'nonexistent@example.com',
                    password: 'password123',
                })
                .expect(401);

            expect(response.body.error.message).toContain('Invalid credentials');
        });
    });

    describe('GET /api/auth/me', () => {
        let authToken: string;

        beforeEach(async () => {
            // Register and get token
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'test@example.com',
                    name: 'Test User',
                    password: 'password123',
                });

            authToken = response.body.token;
        });

        it('should return user info with valid token', async () => {
            const response = await request(app)
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.user.email).toBe('test@example.com');
            expect(response.body.user.name).toBe('Test User');
            expect(response.body.user).not.toHaveProperty('password');
        });

        it('should reject request without token', async () => {
            const response = await request(app)
                .get('/api/auth/me')
                .expect(401);

            expect(response.body.error.message).toContain('Access token required');
        });

        it('should reject request with invalid token', async () => {
            const response = await request(app)
                .get('/api/auth/me')
                .set('Authorization', 'Bearer invalid-token')
                .expect(401);

            expect(response.body.error.message).toContain('Invalid or expired token');
        });
    });

    describe('POST /api/auth/logout', () => {
        it('should logout successfully', async () => {
            const response = await request(app)
                .post('/api/auth/logout')
                .expect(200);

            expect(response.body.message).toContain('Logged out successfully');
        });
    });
});