import { Router } from 'express';
import { FollowController } from '../controllers/FollowController';
import { FollowService } from '../services/FollowService';
import { authenticateToken } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

export function createFollowRoutes(followService: FollowService): Router {
    const router = Router();
    const followController = new FollowController(followService);

    // Follow a user
    router.post('/:userId', authenticateToken, asyncHandler(followController.followUser));

    // Unfollow a user
    router.delete('/:userId', authenticateToken, asyncHandler(followController.unfollowUser));

    // Get follow status
    router.get('/:userId/status', authenticateToken, asyncHandler(followController.getFollowStatus));

    return router;
}