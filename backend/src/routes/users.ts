import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { UserService } from '../services/UserService';
import { PostService } from '../services/PostService';
import { PostController } from '../controllers/PostController';
import { authenticateToken, optionalAuth } from '../middleware/auth';
import { validate, validationSchemas } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';

export function createUserRoutes(userService: UserService, postService: PostService): Router {
    const router = Router();
    const userController = new UserController(userService);
    const postController = new PostController(postService);

    // Get all users (for suggestions) - requires authentication
    router.get('/', authenticateToken, asyncHandler(userController.getAllUsers));

    // Get user profile - optional auth to determine if viewing own profile
    router.get('/:id', validate(validationSchemas.getUserProfile), optionalAuth, asyncHandler(userController.getUserProfile));

    // Update user profile - requires authentication
    router.put('/profile', validate(validationSchemas.updateProfile), authenticateToken, asyncHandler(userController.updateOwnProfile));

    // Update user profile by ID - requires authentication
    router.put('/:id', validate(validationSchemas.updateProfile), authenticateToken, asyncHandler(userController.updateUserProfile));

    // Get user's posts
    router.get('/:userId/posts', validate(validationSchemas.getUserPosts), asyncHandler(postController.getUserPosts));

    return router;
}