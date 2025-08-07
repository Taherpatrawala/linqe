import { Router } from 'express';
import { PostService } from '../services/PostService';
import { PostController } from '../controllers/PostController';
import { authenticateToken } from '../middleware/auth';
import { validate, validationSchemas } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';

export function createPostRoutes(postService: PostService): Router {
    const router = Router();
    const postController = new PostController(postService);

    // Create a new post (requires authentication)
    router.post('/', validate(validationSchemas.createPost), authenticateToken, asyncHandler(postController.createPost));

    // Get all posts (public feed)
    router.get('/', validate(validationSchemas.getAllPosts), asyncHandler(postController.getAllPosts));

    // Get posts from following users (requires authentication)
    router.get('/following', validate(validationSchemas.getAllPosts), authenticateToken, asyncHandler(postController.getFollowingPosts));

    // Get a specific post by ID
    router.get('/:id', validate(validationSchemas.getPostById), asyncHandler(postController.getPostById));

    return router;
}