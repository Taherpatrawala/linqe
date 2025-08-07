import { Request, Response } from 'express';
import { PostService } from '../services/PostService';
import { AuthenticationError, NotFoundError, ValidationError } from '../types/errors';

export class PostController {
    constructor(private postService: PostService) { }

    /**
     * Create a new post
     */
    createPost = async (req: Request, res: Response): Promise<void> => {
        const { content } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            throw new AuthenticationError('Authentication required');
        }

        try {
            const post = await this.postService.createPost(content, userId);
            res.status(201).json(post.toJSON());
        } catch (error: any) {
            const message = error.message || 'Failed to create post';

            if (message.includes('content must be between')) {
                throw new ValidationError(message);
            }

            if (message === 'Author not found') {
                throw new NotFoundError('User not found');
            }

            // Re-throw the original error if it doesn't match known patterns
            throw error;
        }
    };

    /**
     * Get all posts (public feed)
     */
    getAllPosts = async (req: Request, res: Response): Promise<void> => {
        const limit = (req.query['limit'] as unknown as number) || 50; // Already validated and transformed by middleware
        const offset = (req.query['offset'] as unknown as number) || 0; // Already validated and transformed by middleware

        const posts = await this.postService.getAllPosts(limit, offset);
        // const totalCount = await this.postService.getTotalPostsCount();

        res.json(posts.map(post => post.toJSON())
        );
    };

    /**
     * Get posts by a specific user
     */
    getUserPosts = async (req: Request, res: Response): Promise<void> => {
        const userId = req.params['userId'] as unknown as number; // Already validated and transformed by middleware
        const limit = (req.query['limit'] as unknown as number) || 50; // Already validated and transformed by middleware
        const offset = (req.query['offset'] as unknown as number) || 0; // Already validated and transformed by middleware

        const posts = await this.postService.getPostsByUser(userId, limit, offset);
        // const totalCount = await this.postService.getPostsCountByUser(userId);

        res.json(posts.map(post => post.toJSON()));
    };

    /**
     * Get a specific post by ID
     */
    getPostById = async (req: Request, res: Response): Promise<void> => {
        const postId = req.params['id'] as unknown as number; // Already validated and transformed by middleware

        const post = await this.postService.getPostById(postId);

        if (!post) {
            throw new NotFoundError('Post not found');
        }

        res.json(post.toJSON());
    };

    /**
     * Get posts from users that the current user is following
     */
    getFollowingPosts = async (req: Request, res: Response): Promise<void> => {
        const userId = req.user?.id;

        if (!userId) {
            throw new AuthenticationError('Authentication required');
        }

        try {
            const limit = (req.query['limit'] as unknown as number) || 50;
            const offset = (req.query['offset'] as unknown as number) || 0;

            console.log(`Controller: Getting following posts for user ${userId}`);
            const posts = await this.postService.getFollowingPosts(userId, limit, offset);
            console.log(`Controller: Returning ${posts.length} posts`);

            res.json(posts.map(post => post.toJSON()));
        } catch (error: any) {
            console.error('Error in getFollowingPosts controller:', error);

            // Return empty array instead of error to prevent frontend crashes
            console.log('Controller: Returning empty array due to error');
            res.json([]);
        }
    };
}