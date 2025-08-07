import { MikroORM } from '@mikro-orm/core';
import { SqliteDriver } from '@mikro-orm/sqlite';
import { User } from '../entities/User';
import { Post } from '../entities/Post';
import { UserService } from '../services/UserService';
import { it } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';
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

describe('UserService', () => {
    let orm: MikroORM;
    let userService: UserService;
    let testUser1: User;
    let testUser2: User;

    beforeAll(async () => {
        orm = await MikroORM.init({
            entities: [User, Post],
            driver: SqliteDriver,
            dbName: ':memory:',
        });
        await orm.getSchemaGenerator().createSchema();
    });

    afterAll(async () => {
        await orm.close();
    });

    beforeEach(async () => {
        const em = orm.em.fork();
        userService = new UserService(em);

        // Create test users
        testUser1 = new User('user1@test.com', 'User One', 'password123', 'Bio for user one');
        testUser2 = new User('user2@test.com', 'User Two', 'password123');

        await em.persistAndFlush([testUser1, testUser2]);
        em.clear();
    });

    afterEach(async () => {
        await orm.getSchemaGenerator().clearDatabase();
    });

    describe('getUserProfile', () => {
        it('should return full profile when user views own profile', async () => {
            const profile = await userService.getUserProfile(testUser1.id, testUser1.id);

            expect(profile).toEqual({
                id: testUser1.id,
                email: testUser1.email,
                name: testUser1.name,
                bio: testUser1.bio,
                createdAt: expect.any(Date),
            });
        });

        it('should return public profile when user views another user profile', async () => {
            const profile = await userService.getUserProfile(testUser1.id, testUser2.id);

            expect(profile).toEqual({
                id: testUser1.id,
                name: testUser1.name,
                bio: testUser1.bio,
                createdAt: expect.any(Date),
            });
            expect(profile).not.toHaveProperty('email');
        });

        it('should return public profile when no requesting user ID provided', async () => {
            const profile = await userService.getUserProfile(testUser1.id);

            expect(profile).toEqual({
                id: testUser1.id,
                name: testUser1.name,
                bio: testUser1.bio,
                createdAt: expect.any(Date),
            });
            expect(profile).not.toHaveProperty('email');
        });

        it('should return null for non-existent user', async () => {
            const profile = await userService.getUserProfile(99999);
            expect(profile).toBeNull();
        });

        it('should handle user with no bio', async () => {
            const profile = await userService.getUserProfile(testUser2.id);

            expect(profile).toEqual({
                id: testUser2.id,
                name: testUser2.name,
                bio: null, // SQLite returns null instead of undefined
                createdAt: expect.any(Date),
            });
        });
    });

    describe('updateUserProfile', () => {
        it('should update user bio successfully', async () => {
            const newBio = 'Updated bio for user';
            const updatedProfile = await userService.updateUserProfile(testUser1.id, { bio: newBio });

            expect(updatedProfile).toEqual({
                id: testUser1.id,
                email: testUser1.email,
                name: testUser1.name,
                bio: newBio,
                createdAt: expect.any(Date),
            });

            // Verify in database
            const em = orm.em.fork();
            const userFromDb = await em.findOne(User, { id: testUser1.id });
            expect(userFromDb?.bio).toBe(newBio);
        });

        it('should clear bio when empty string provided', async () => {
            const updatedProfile = await userService.updateUserProfile(testUser1.id, { bio: '' });

            expect(updatedProfile.bio).toBeUndefined();

            // Verify in database
            const em = orm.em.fork();
            const userFromDb = await em.findOne(User, { id: testUser1.id });
            expect(userFromDb?.bio).toBeNull(); // SQLite returns null instead of undefined
        });

        it('should trim whitespace from bio', async () => {
            const bioWithWhitespace = '  Updated bio with whitespace  ';
            const expectedBio = 'Updated bio with whitespace';

            const updatedProfile = await userService.updateUserProfile(testUser1.id, { bio: bioWithWhitespace });

            expect(updatedProfile.bio).toBe(expectedBio);
        });

        it('should throw error for bio exceeding 500 characters', async () => {
            const longBio = 'a'.repeat(501);

            await expect(userService.updateUserProfile(testUser1.id, { bio: longBio }))
                .rejects.toThrow('Bio cannot exceed 500 characters');
        });

        it('should allow bio with exactly 500 characters', async () => {
            const maxBio = 'a'.repeat(500);

            const updatedProfile = await userService.updateUserProfile(testUser1.id, { bio: maxBio });

            expect(updatedProfile.bio).toBe(maxBio);
        });

        it('should throw error for non-existent user', async () => {
            await expect(userService.updateUserProfile(99999, { bio: 'New bio' }))
                .rejects.toThrow('User not found');
        });

        it('should not update anything when no data provided', async () => {
            const em = orm.em.fork();
            const originalUser = await em.findOne(User, { id: testUser1.id });
            const originalBio = originalUser?.bio;

            const updatedProfile = await userService.updateUserProfile(testUser1.id, {});

            expect(updatedProfile.bio).toBe(originalBio);
        });
    });

    describe('userExists', () => {
        it('should return true for existing user', async () => {
            const exists = await userService.userExists(testUser1.id);
            expect(exists).toBe(true);
        });

        it('should return false for non-existent user', async () => {
            const exists = await userService.userExists(99999);
            expect(exists).toBe(false);
        });
    });
});