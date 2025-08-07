import request from 'supertest';
import express from 'express';
import { MikroORM } from '@mikro-orm/core';
import { SqliteDriver } from '@mikro-orm/sqlite';
import { User } from '../entities/User';
import { Post } from '../entities/Post';
import { UserService } from '../services/UserService';
import { createUserRoutes } from '../routes/users';
import { injectORM } from '../middleware/orm';
import { JWTUtils } from '../utils/jwt';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
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
import { it } from 'node:test';
import { describe } from 'node:test';
import { afterEach } from 'node:test';
import { beforeEach } from 'node:test';
import { describe } from 'node:test';

describe('User Profile Endpoints', () => {
    let app: express.Application;
    let orm: MikroORM;
    let testUser1: User;
    let testUser2: User;
    let user1Token: string;
    let user2Token: string;

    beforeAll(async () => {
        orm = await MikroORM.init({
            entities: [User, Post],
            driver: SqliteDriver,
            dbName: ':memory:',
            allowGlobalContext: true, // Allow global context for tests
        });
        await orm.getSchemaGenerator().createSchema();

        // Setup Express app
        app = express();
        app.use(express.json());
        app.use(injectORM(orm));

        const userService = new UserService(orm.em.fork());
        app.use('/api/users', createUserRoutes(userService));
    });

    afterAll(async () => {
        await orm.close();
    });

    beforeEach(async () => {
        // Create test users
        testUser1 = new User('user1@test.com', 'User One', 'password123', 'Bio for user one');
        testUser2 = new User('user2@test.com', 'User Two', 'password123');

        // Use the global entity manager to ensure users are available to auth middleware
        await orm.em.persistAndFlush([testUser1, testUser2]);

        // Generate tokens
        user1Token = JWTUtils.generateToken(testUser1);
        user2Token = JWTUtils.generateToken(testUser2);

        orm.em.clear();
    });

    afterEach(async () => {
        await orm.getSchemaGenerator().clearDatabase();
    });

    describe('GET /api/users/:id', () => {
        it('should return full profile when user views own profile', async () => {
            const response = await request(app)
                .get(`/api/users/${testUser1.id}`)
                .set('Authorization', `Bearer ${user1Token}`)
                .expect(200);

            expect(response.body).toEqual({
                user: {
                    id: testUser1.id,
                    email: testUser1.email,
                    name: testUser1.name,
                    bio: testUser1.bio,
                    createdAt: expect.any(String),
                }
            });
        });

        it('should return public profile when user views another user profile', async () => {
            const response = await request(app)
                .get(`/api/users/${testUser1.id}`)
                .set('Authorization', `Bearer ${user2Token}`)
                .expect(200);

            expect(response.body).toEqual({
                user: {
                    id: testUser1.id,
                    name: testUser1.name,
                    bio: testUser1.bio,
                    createdAt: expect.any(String),
                }
            });
            expect(response.body.user).not.toHaveProperty('email');
        });

        it('should return public profile when no authentication provided', async () => {
            const response = await request(app)
                .get(`/api/users/${testUser1.id}`)
                .expect(200);

            expect(response.body).toEqual({
                user: {
                    id: testUser1.id,
                    name: testUser1.name,
                    bio: testUser1.bio,
                    createdAt: expect.any(String),
                }
            });
            expect(response.body.user).not.toHaveProperty('email');
        });

        it('should return 404 for non-existent user', async () => {
            const response = await request(app)
                .get('/api/users/99999')
                .expect(404);

            expect(response.body).toEqual({
                error: {
                    message: 'User not found',
                    code: 'USER_NOT_FOUND'
                }
            });
        });

        it('should return 400 for invalid user ID', async () => {
            const response = await request(app)
                .get('/api/users/invalid')
                .expect(400);

            expect(response.body).toEqual({
                error: {
                    message: 'Invalid user ID',
                    code: 'INVALID_USER_ID'
                }
            });
        });
    });

    describe('PUT /api/users/:id', () => {
        it('should update user bio successfully', async () => {
            const newBio = 'Updated bio for user';

            const response = await request(app)
                .put(`/api/users/${testUser1.id}`)
                .set('Authorization', `Bearer ${user1Token}`)
                .send({ bio: newBio })
                .expect(200);

            expect(response.body).toEqual({
                user: {
                    id: testUser1.id,
                    email: testUser1.email,
                    name: testUser1.name,
                    bio: newBio,
                    createdAt: expect.any(String),
                }
            });
        });

        it('should clear bio when empty string provided', async () => {
            const response = await request(app)
                .put(`/api/users/${testUser1.id}`)
                .set('Authorization', `Bearer ${user1Token}`)
                .send({ bio: '' })
                .expect(200);

            expect(response.body.user.bio).toBeUndefined();
        });

        it('should return 401 when not authenticated', async () => {
            const response = await request(app)
                .put(`/api/users/${testUser1.id}`)
                .send({ bio: 'New bio' })
                .expect(401);

            expect(response.body).toEqual({
                error: {
                    message: 'Access token required',
                    code: 'MISSING_TOKEN'
                }
            });
        });

        it('should return 403 when trying to update another user profile', async () => {
            const response = await request(app)
                .put(`/api/users/${testUser2.id}`)
                .set('Authorization', `Bearer ${user1Token}`)
                .send({ bio: 'New bio' })
                .expect(403);

            expect(response.body).toEqual({
                error: {
                    message: 'You can only update your own profile',
                    code: 'FORBIDDEN'
                }
            });
        });

        it('should return 400 for bio exceeding 500 characters', async () => {
            const longBio = 'a'.repeat(501);

            const response = await request(app)
                .put(`/api/users/${testUser1.id}`)
                .set('Authorization', `Bearer ${user1Token}`)
                .send({ bio: longBio })
                .expect(400);

            expect(response.body).toEqual({
                error: {
                    message: 'Bio cannot exceed 500 characters',
                    code: 'BIO_TOO_LONG'
                }
            });
        });

        it('should return 400 for invalid bio type', async () => {
            const response = await request(app)
                .put(`/api/users/${testUser1.id}`)
                .set('Authorization', `Bearer ${user1Token}`)
                .send({ bio: 123 })
                .expect(400);

            expect(response.body).toEqual({
                error: {
                    message: 'Bio must be a string',
                    code: 'INVALID_BIO_TYPE'
                }
            });
        });

        it('should return 400 for invalid user ID', async () => {
            const response = await request(app)
                .put('/api/users/invalid')
                .set('Authorization', `Bearer ${user1Token}`)
                .send({ bio: 'New bio' })
                .expect(400);

            expect(response.body).toEqual({
                error: {
                    message: 'Invalid user ID',
                    code: 'INVALID_USER_ID'
                }
            });
        });

        it('should return 401 for non-existent user token', async () => {
            // Create a token for a non-existent user
            const fakeUser = { id: 99999, email: 'fake@test.com' };
            const fakeToken = JWTUtils.generateToken(fakeUser as any);

            const response = await request(app)
                .put('/api/users/99999')
                .set('Authorization', `Bearer ${fakeToken}`)
                .send({ bio: 'New bio' })
                .expect(401); // Will be 401 because user doesn't exist in auth middleware

            expect(response.body.error.code).toBe('USER_NOT_FOUND');
        });

        it('should handle empty request body', async () => {
            const response = await request(app)
                .put(`/api/users/${testUser1.id}`)
                .set('Authorization', `Bearer ${user1Token}`)
                .send({})
                .expect(200);

            // Should return current user data unchanged
            expect(response.body.user.bio).toBe(testUser1.bio);
        });
    });
});