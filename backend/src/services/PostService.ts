import { EntityManager } from '@mikro-orm/core';
import { Post } from '../entities/Post';
import { User } from '../entities/User';
import { Follow } from '../entities/Follow';

export class PostService {
    constructor(private em: EntityManager) { }

    /**
     * Create a new post
     */
    async createPost(content: string, authorId: number): Promise<Post> {
        // Validate content
        if (!Post.isValidContent(content)) {
            throw new Error('Post content must be between 1 and 1000 characters');
        }

        // Find the author
        const author = await this.em.findOne(User, { id: authorId });
        if (!author) {
            throw new Error('Author not found');
        }

        // Create and persist the post
        const post = new Post(content.trim(), author);
        await this.em.persistAndFlush(post);

        // Return post with author information loaded
        await this.em.populate(post, ['author']);
        return post;
    }

    /**
     * Get all posts ordered by creation date (most recent first)
     */
    async getAllPosts(limit: number = 50, offset: number = 0): Promise<Post[]> {
        return this.em.find(Post, {}, {
            populate: ['author'],
            orderBy: { createdAt: 'DESC' },
            limit,
            offset,
        });
    }

    /**
     * Get posts by a specific user
     */
    async getPostsByUser(userId: number, limit: number = 50, offset: number = 0): Promise<Post[]> {
        return this.em.find(Post, { author: userId }, {
            populate: ['author'],
            orderBy: { createdAt: 'DESC' },
            limit,
            offset,
        });
    }

    /**
     * Get a specific post by ID
     */
    async getPostById(id: number): Promise<Post | null> {
        return this.em.findOne(Post, { id }, {
            populate: ['author'],
        });
    }

    /**
     * Get total count of posts
     */
    async getTotalPostsCount(): Promise<number> {
        return this.em.count(Post);
    }

    /**
     * Get total count of posts by user
     */
    async getPostsCountByUser(userId: number): Promise<number> {
        return this.em.count(Post, { author: userId });
    }

    /**
     * Get posts from users that the current user is following
     */
    async getFollowingPosts(userId: number, limit: number = 50, offset: number = 0): Promise<Post[]> {
        try {
            console.log(`Getting following posts for user ${userId}`);

            // Use a fresh entity manager fork
            const em = this.em.fork();

            // First get the users that this user is following
            const follows = await em.find(Follow, {
                follower: userId
            }, {
                populate: ['following']
            });

            console.log(`Found ${follows.length} follows for user ${userId}`);

            // If not following anyone, return empty array
            if (follows.length === 0) {
                console.log('User is not following anyone, returning empty array');
                return [];
            }

            // Extract the IDs of users being followed
            const followingUserIds = follows.map(follow => follow.following.id);
            console.log('Following user IDs:', followingUserIds);

            // If no valid IDs, return empty array
            if (followingUserIds.length === 0) {
                console.log('No valid following user IDs found');
                return [];
            }

            // Then get posts from those users
            const posts = await em.find(Post, {
                author: { $in: followingUserIds }
            }, {
                populate: ['author'],
                orderBy: { createdAt: 'DESC' },
                limit,
                offset,
            });

            console.log(`Found ${posts.length} posts from followed users`);
            return posts;
        } catch (error) {
            console.error('Error in getFollowingPosts:', error);
            console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');

            // Return empty array instead of throwing error to prevent crashes
            console.log('Returning empty array due to error');
            return [];
        }
    }
}