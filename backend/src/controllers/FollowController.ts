import { Request, Response } from 'express';
import { FollowService } from '../services/FollowService';
import { AuthenticationError, NotFoundError, ValidationError } from '../types/errors';

export class FollowController {
    constructor(private followService: FollowService) { }

    /**
     * Follow a user
     * POST /api/follows/:userId
     */
    followUser = async (req: Request, res: Response): Promise<void> => {
        if (!req.user) {
            throw new AuthenticationError('Authentication required');
        }

        const userIdParam = req.params['userId'];
        if (!userIdParam) {
            throw new ValidationError('User ID is required');
        }

        const followingId = parseInt(userIdParam, 10);
        const followerId = req.user.id;

        if (isNaN(followingId)) {
            throw new ValidationError('Invalid user ID');
        }

        try {
            const result = await this.followService.followUser(followerId, followingId);
            res.status(200).json(result);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to follow user';

            if (message.includes('Cannot follow yourself')) {
                throw new ValidationError('Cannot follow yourself');
            } else if (message.includes('User not found')) {
                throw new NotFoundError('User not found');
            } else if (message.includes('Already following')) {
                throw new ValidationError('Already following this user');
            }

            throw error;
        }
    };

    /**
     * Unfollow a user
     * DELETE /api/follows/:userId
     */
    unfollowUser = async (req: Request, res: Response): Promise<void> => {
        if (!req.user) {
            throw new AuthenticationError('Authentication required');
        }

        const userIdParam = req.params['userId'];
        if (!userIdParam) {
            throw new ValidationError('User ID is required');
        }

        const followingId = parseInt(userIdParam, 10);
        const followerId = req.user.id;

        if (isNaN(followingId)) {
            throw new ValidationError('Invalid user ID');
        }

        try {
            const result = await this.followService.unfollowUser(followerId, followingId);
            res.status(200).json(result);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to unfollow user';

            if (message.includes('User not found')) {
                throw new NotFoundError('User not found');
            } else if (message.includes('Not following')) {
                throw new ValidationError('Not following this user');
            }

            throw error;
        }
    };

    /**
     * Get follow status
     * GET /api/follows/:userId/status
     */
    getFollowStatus = async (req: Request, res: Response): Promise<void> => {
        if (!req.user) {
            throw new AuthenticationError('Authentication required');
        }

        const userIdParam = req.params['userId'];
        if (!userIdParam) {
            throw new ValidationError('User ID is required');
        }

        const followingId = parseInt(userIdParam, 10);
        const followerId = req.user.id;

        if (isNaN(followingId)) {
            throw new ValidationError('Invalid user ID');
        }

        try {
            const result = await this.followService.getFollowStatus(followerId, followingId);
            res.status(200).json(result);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to get follow status';

            if (message.includes('User not found')) {
                throw new NotFoundError('User not found');
            }

            throw error;
        }
    };
}