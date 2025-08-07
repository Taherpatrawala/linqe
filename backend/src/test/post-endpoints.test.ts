import request from 'supertest';
import { MikroORM } from '@mikro-orm/core';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import express from 'express';
import { User } from '../entities/User';
import { Post } from '../entities/Post';
import { PostService } from '../services/PostService';
import { createPostRoutes } from '../routes/posts';
import { createUserRoutes } from '../routes/users';
import { UserService } from '../services/UserService';

import { injectORM } from '../middleware/orm';
import mikroOrmConfig from '../mikro-orm.config';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { beforeEach } from 'node:test';
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
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { beforeEach } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { beforeEach } from 'node:test';
import { describe } from 'node:test';

describe('Post API Endpoints', () => {
    let orm: MikroORM<PostgreSqlDriver>;
    let app: express.Application;
    let testUser: User;
    let authToken: string;

    beforeAll(async () => {
        orm = await MikroORM.init(mikroOrmConfig);
        await orm.getSchemaGenerator().refreshDatabase();

        // Create Express app
        app = express();
        app.use(express.json());
        app.use(injectORM(orm));

        // Create services
        const postService = new PostService(orm.em.fork());
        const userService = new UserService(orm.em.fork());

        // Add routes
        app.use('/api/posts', createPostRoutes(postService));
        app.use('/api/users', createUserRoutes(userService, postService));
    });

    beforeEach(async () => {
        await orm.getSchemaGenerator().clearDatabase();

        const em = orm.em.fork();

        // Create test user
        testUser = new User('test@example.com', 'Test User', 'password123');
        await em.persistAndFlush(testUser);

        // Generate auth token using JWT utils
        const { JWTUtils } = await import('../utils/jwt');
        authToken = JWTUtils.generateToken(testUser);
    });

    afterAll(async () => {
        await orm.close();
    });

    describe('POST /api/posts', () => {
        it('should create a post with valid data and authentication', async () => {
            const postData = {
                content: 'This is a test post'
            };

            const response = await request(app)
                .post('/api/posts')
                .set('Authorization', `Bearer ${authToken}`)
                .send(postData)
                .expect(201);

            expect(response.body).toMatchObject({
                content: 'This is a test post',
                author: {
                    id: testUser.id,
                    name: 'Test User'
                }
            });
            expect(response.body.id).toBeDefined();
            expect(response.body.createdAt).toBeDefined();
        });

        it('should return 401 without authentication', async () => {
            const postData = {
                content: 'This is a test post'
            };

            const response = await request(app)
                .post('/api/posts')
                .send(postData)
                .expect(401);

            expect(response.body.error.code).toBe('UNAUTHORIZED');
        });

        it('should return 400 for empty content', async () => {
            const postData = {
                content: ''
            };

            const response = await request(app)
                .post('/api/posts')
                .set('Authorization', `Bearer ${authToken}`)
                .send(postData)
                .expect(400);

            expect(response.body.error.code).toBe('VALIDATION_ERROR');
            expect(response.body.error.message).toContain('content must be between');
        });

        it('should return 400 for missing content', async () => {
            const response = await request(app)
                .post('/api/posts')
                .set('Authorization', `Bearer ${authToken}`)
                .send({})
                .expect(400);

            expect(response.body.error.code).toBe('VALIDATION_ERROR');
            expect(response.body.error.message).toContain('Content is required');
        });

        it('should return 400 for content exceeding 1000 characters', async () => {
            const postData = {
                content: 'a'.repeat(1001)
            };

            const response = await request(app)
                .post('/api/posts')
                .set('Authorization', `Bearer ${authToken}`)
                .send(postData)
                .expect(400);

            expect(response.body.error.code).toBe('VALIDATION_ERROR');
            expect(response.body.error.message).toContain('content must be between');
        });

        it('should trim whitespace from content', async () => {
            const postData = {
                content: '  This is a test post with whitespace  '
            };

            const response = await request(app)
                .post('/api/posts')
                .set('Authorization', `Bearer ${authToken}`)
                .send(postData)
                .expect(201);

            expect(response.body.content).toBe('This is a test post with whitespace');
        });
    });

    describe('GET /api/posts', () => {
        beforeEach(async () => {
            const em = orm.em.fork();

            // Create multiple posts with different timestamps
            const post1 = new Post('First post', testUser);
            const post2 = new Post('Second post', testUser);
            const post3 = new Post('Third post', testUser);

            post1.createdAt = new Date('2023-01-01');
            post2.createdAt = new Date('2023-01-02');
            post3.createdAt = new Date('2023-01-03');

            await em.persistAndFlush([post1, post2, post3]);
        });

        it('should return all posts ordered by creation date (newest first)', async () => {
            const response = await request(app)
                .get('/api/posts')
                .expect(200);

            expect(response.body.posts).toHaveLength(3);
            expect(response.body.posts[0].content).toBe('Third post');
            expect(response.body.posts[1].content).toBe('Second post');
            expect(response.body.posts[2].content).toBe('First post');

            // Check pagination info
            expect(response.body.pagination).toMatchObject({
                limit: 50,
                offset: 0,
                total: 3,
                hasMore: false
            });
        });

        it('should respect limit parameter', async () => {
            const response = await request(app)
                .get('/api/posts?limit=2')
                .expect(200);

            expect(response.body.posts).toHaveLength(2);
            expect(response.body.posts[0].content).toBe('Third post');
            expect(response.body.posts[1].content).toBe('Second post');

            expect(response.body.pagination).toMatchObject({
                limit: 2,
                offset: 0,
                total: 3,
                hasMore: true
            });
        });

        it('should respect offset parameter', async () => {
            const response = await request(app)
                .get('/api/posts?offset=1')
                .expect(200);

            expect(response.body.posts).toHaveLength(2);
            expect(response.body.posts[0].content).toBe('Second post');
            expect(response.body.posts[1].content).toBe('First post');

            expect(response.body.pagination).toMatchObject({
                limit: 50,
                offset: 1,
                total: 3,
                hasMore: false
            });
        });

        it('should return 400 for invalid limit', async () => {
            const response = await request(app)
                .get('/api/posts?limit=101')
                .expect(400);

            expect(response.body.error.code).toBe('VALIDATION_ERROR');
            expect(response.body.error.message).toContain('Limit must be between 1 and 100');
        });

        it('should return 400 for negative offset', async () => {
            const response = await request(app)
                .get('/api/posts?offset=-1')
                .expect(400);

            expect(response.body.error.code).toBe('VALIDATION_ERROR');
            expect(response.body.error.message).toContain('Offset must be non-negative');
        });

        it('should include author information in posts', async () => {
            const response = await request(app)
                .get('/api/posts')
                .expect(200);

            expect(response.body.posts[0].author).toMatchObject({
                id: testUser.id,
                name: 'Test User'
            });
        });

        it('should return empty array when no posts exist', async () => {
            await orm.getSchemaGenerator().clearDatabase();

            const response = await request(app)
                .get('/api/posts')
                .expect(200);

            expect(response.body.posts).toHaveLength(0);
            expect(response.body.pagination.total).toBe(0);
        });
    });

    describe('GET /api/posts/:id', () => {
        let testPost: Post;

        beforeEach(async () => {
            const em = orm.em.fork();
            testPost = new Post('Test post for ID lookup', testUser);
            await em.persistAndFlush(testPost);
        });

        it('should return post by ID with author information', async () => {
            const response = await request(app)
                .get(`/api/posts/${testPost.id}`)
                .expect(200);

            expect(response.body).toMatchObject({
                id: testPost.id,
                content: 'Test post for ID lookup',
                author: {
                    id: testUser.id,
                    name: 'Test User'
                }
            });
            expect(response.body.createdAt).toBeDefined();
        });

        it('should return 404 for non-existent post', async () => {
            const response = await request(app)
                .get('/api/posts/99999')
                .expect(404);

            expect(response.body.error.code).toBe('NOT_FOUND');
            expect(response.body.error.message).toBe('Post not found');
        });

        it('should return 400 for invalid post ID', async () => {
            const response = await request(app)
                .get('/api/posts/invalid')
                .expect(400);

            expect(response.body.error.code).toBe('VALIDATION_ERROR');
            expect(response.body.error.message).toBe('Invalid post ID');
        });
    });

    describe('GET /api/users/:userId/posts', () => {
        let anotherUser: User;

        beforeEach(async () => {
            const em = orm.em.fork();

            // Create another user
            anotherUser = new User('another@example.com', 'Another User', 'password123');
            await em.persistAndFlush(anotherUser);

            // Create posts for both users
            const post1 = new Post('Post by test user 1', testUser);
            const post2 = new Post('Post by another user', anotherUser);
            const post3 = new Post('Post by test user 2', testUser);

            post1.createdAt = new Date('2023-01-01');
            post2.createdAt = new Date('2023-01-02');
            post3.createdAt = new Date('2023-01-03');

            await em.persistAndFlush([post1, post2, post3]);
        });

        it('should return only posts by specified user', async () => {
            const response = await request(app)
                .get(`/api/users/${testUser.id}/posts`)
                .expect(200);

            expect(response.body.posts).toHaveLength(2);
            expect(response.body.posts[0].content).toBe('Post by test user 2');
            expect(response.body.posts[1].content).toBe('Post by test user 1');
            expect(response.body.posts[0].author.id).toBe(testUser.id);
            expect(response.body.posts[1].author.id).toBe(testUser.id);

            expect(response.body.pagination).toMatchObject({
                limit: 50,
                offset: 0,
                total: 2,
                hasMore: false
            });
        });

        it('should return empty array for user with no posts', async () => {
            const em = orm.em.fork();
            const userWithNoPosts = new User('noposts@example.com', 'No Posts User', 'password123');
            await em.persistAndFlush(userWithNoPosts);

            const response = await request(app)
                .get(`/api/users/${userWithNoPosts.id}/posts`)
                .expect(200);

            expect(response.body.posts).toHaveLength(0);
            expect(response.body.pagination.total).toBe(0);
        });

        it('should respect pagination parameters', async () => {
            const response = await request(app)
                .get(`/api/users/${testUser.id}/posts?limit=1&offset=1`)
                .expect(200);

            expect(response.body.posts).toHaveLength(1);
            expect(response.body.posts[0].content).toBe('Post by test user 1');

            expect(response.body.pagination).toMatchObject({
                limit: 1,
                offset: 1,
                total: 2,
                hasMore: false
            });
        });

        it('should return 400 for invalid user ID', async () => {
            const response = await request(app)
                .get('/api/users/invalid/posts')
                .expect(400);

            expect(response.body.error.code).toBe('VALIDATION_ERROR');
            expect(response.body.error.message).toBe('Invalid user ID');
        });

        it('should return 400 for invalid pagination parameters', async () => {
            const response = await request(app)
                .get(`/api/users/${testUser.id}/posts?limit=101`)
                .expect(400);

            expect(response.body.error.code).toBe('VALIDATION_ERROR');
            expect(response.body.error.message).toContain('Limit must be between 1 and 100');
        });
    });
});