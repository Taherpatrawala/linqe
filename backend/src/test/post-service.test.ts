import { MikroORM } from '@mikro-orm/core';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { PostService } from '../services/PostService';
import { User } from '../entities/User';
import { Post } from '../entities/Post';
import mikroOrmConfig from '../mikro-orm.config';

describe('PostService', () => {
    let orm: MikroORM<PostgreSqlDriver>;
    let postService: PostService;
    let testUser: User;

    beforeAll(async () => {
        orm = await MikroORM.init(mikroOrmConfig);
        await orm.getSchemaGenerator().refreshDatabase();
    });

    beforeEach(async () => {
        const em = orm.em.fork();
        postService = new PostService(em);

        // Create a test user
        testUser = new User('test@example.com', 'Test User', 'password123');
        await em.persistAndFlush(testUser);
    });

    afterEach(async () => {
        await orm.getSchemaGenerator().clearDatabase();
    });

    afterAll(async () => {
        await orm.close();
    });

    describe('createPost', () => {
        it('should create a post with valid content', async () => {
            const content = 'This is a test post';
            const post = await postService.createPost(content, testUser.id);

            expect(post).toBeDefined();
            expect(post.content).toBe(content);
            expect(post.author.getEntity().id).toBe(testUser.id);
            expect(post.createdAt).toBeInstanceOf(Date);
        });

        it('should trim whitespace from content', async () => {
            const content = '  This is a test post with whitespace  ';
            const post = await postService.createPost(content, testUser.id);

            expect(post.content).toBe('This is a test post with whitespace');
        });

        it('should throw error for empty content', async () => {
            await expect(postService.createPost('', testUser.id))
                .rejects.toThrow('Post content must be between 1 and 1000 characters');
        });

        it('should throw error for whitespace-only content', async () => {
            await expect(postService.createPost('   ', testUser.id))
                .rejects.toThrow('Post content must be between 1 and 1000 characters');
        });

        it('should throw error for content exceeding 1000 characters', async () => {
            const longContent = 'a'.repeat(1001);
            await expect(postService.createPost(longContent, testUser.id))
                .rejects.toThrow('Post content must be between 1 and 1000 characters');
        });

        it('should throw error for non-existent author', async () => {
            await expect(postService.createPost('Test content', 99999))
                .rejects.toThrow('Author not found');
        });
    });

    describe('getAllPosts', () => {
        beforeEach(async () => {
            const em = orm.em.fork();
            // Create multiple posts
            const post1 = new Post('First post', testUser);
            const post2 = new Post('Second post', testUser);
            const post3 = new Post('Third post', testUser);

            // Set different creation times to test ordering
            post1.createdAt = new Date('2023-01-01');
            post2.createdAt = new Date('2023-01-02');
            post3.createdAt = new Date('2023-01-03');

            await em.persistAndFlush([post1, post2, post3]);
        });

        it('should return all posts ordered by creation date (newest first)', async () => {
            const posts = await postService.getAllPosts();

            expect(posts).toHaveLength(3);
            expect(posts[0]?.content).toBe('Third post');
            expect(posts[1]?.content).toBe('Second post');
            expect(posts[2]?.content).toBe('First post');
        });

        it('should respect limit parameter', async () => {
            const posts = await postService.getAllPosts(2);

            expect(posts).toHaveLength(2);
            expect(posts[0]?.content).toBe('Third post');
            expect(posts[1]?.content).toBe('Second post');
        });

        it('should respect offset parameter', async () => {
            const posts = await postService.getAllPosts(10, 1);

            expect(posts).toHaveLength(2);
            expect(posts[0]?.content).toBe('Second post');
            expect(posts[1]?.content).toBe('First post');
        });

        it('should populate author information', async () => {
            const posts = await postService.getAllPosts();

            expect(posts[0]?.author.getEntity().name).toBe('Test User');
            expect(posts[0]?.author.getEntity().email).toBe('test@example.com');
        });
    });

    describe('getPostsByUser', () => {
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
            const posts = await postService.getPostsByUser(testUser.id);

            expect(posts).toHaveLength(2);
            expect(posts[0]?.content).toBe('Post by test user 2');
            expect(posts[1]?.content).toBe('Post by test user 1');
            expect(posts[0]?.author.getEntity().id).toBe(testUser.id);
            expect(posts[1]?.author.getEntity().id).toBe(testUser.id);
        });

        it('should return empty array for user with no posts', async () => {
            const em = orm.em.fork();
            const userWithNoPosts = new User('noposts@example.com', 'No Posts User', 'password123');
            await em.persistAndFlush(userWithNoPosts);

            const posts = await postService.getPostsByUser(userWithNoPosts.id);

            expect(posts).toHaveLength(0);
        });

        it('should respect limit and offset parameters', async () => {
            const posts = await postService.getPostsByUser(testUser.id, 1, 1);

            expect(posts).toHaveLength(1);
            expect(posts[0]?.content).toBe('Post by test user 1');
        });
    });

    describe('getPostById', () => {
        let testPost: Post;

        beforeEach(async () => {
            const em = orm.em.fork();
            testPost = new Post('Test post for ID lookup', testUser);
            await em.persistAndFlush(testPost);
        });

        it('should return post with populated author', async () => {
            const post = await postService.getPostById(testPost.id);

            expect(post).toBeDefined();
            expect(post!.content).toBe('Test post for ID lookup');
            expect(post!.author.getEntity().name).toBe('Test User');
        });

        it('should return null for non-existent post', async () => {
            const post = await postService.getPostById(99999);

            expect(post).toBeNull();
        });
    });

    describe('getTotalPostsCount', () => {
        it('should return correct total count', async () => {
            const em = orm.em.fork();
            const post1 = new Post('Post 1', testUser);
            const post2 = new Post('Post 2', testUser);
            await em.persistAndFlush([post1, post2]);

            const count = await postService.getTotalPostsCount();

            expect(count).toBe(2);
        });

        it('should return 0 when no posts exist', async () => {
            const count = await postService.getTotalPostsCount();

            expect(count).toBe(0);
        });
    });

    describe('getPostsCountByUser', () => {
        let anotherUser: User;

        beforeEach(async () => {
            const em = orm.em.fork();

            anotherUser = new User('another@example.com', 'Another User', 'password123');
            await em.persistAndFlush(anotherUser);

            const post1 = new Post('Post by test user 1', testUser);
            const post2 = new Post('Post by another user', anotherUser);
            const post3 = new Post('Post by test user 2', testUser);

            await em.persistAndFlush([post1, post2, post3]);
        });

        it('should return correct count for user with posts', async () => {
            const count = await postService.getPostsCountByUser(testUser.id);

            expect(count).toBe(2);
        });

        it('should return correct count for user with different number of posts', async () => {
            const count = await postService.getPostsCountByUser(anotherUser.id);

            expect(count).toBe(1);
        });

        it('should return 0 for user with no posts', async () => {
            const em = orm.em.fork();
            const userWithNoPosts = new User('noposts@example.com', 'No Posts User', 'password123');
            await em.persistAndFlush(userWithNoPosts);

            const count = await postService.getPostsCountByUser(userWithNoPosts.id);

            expect(count).toBe(0);
        });
    });
});