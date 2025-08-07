import { Request, Response } from 'express';
import { UserService, UpdateProfileData } from '../services/UserService';
import { AuthenticationError, AuthorizationError, NotFoundError, ValidationError } from '../types/errors';

export class UserController {
    constructor(private userService: UserService) { }

    /**
     * Get user profile by ID
     * GET /api/users/:id
     */
    getUserProfile = async (req: Request, res: Response): Promise<void> => {
        const userId = req.params['id'] as unknown as number; // Already validated and transformed by middleware
        const requestingUserId = req.user?.id;

        const userProfile = await this.userService.getUserProfile(userId, requestingUserId);

        if (!userProfile) {
            throw new NotFoundError('User not found');
        }

        res.status(200).json(userProfile);
    };

    /**
     * Update user profile (only own profile)
     * PUT /api/users/:id
     */
    updateUserProfile = async (req: Request, res: Response): Promise<void> => {
        const userId = req.user?.id as unknown as number; // Already validated and transformed by middleware

        // Check if user is authenticated
        if (!req.user) {
            throw new AuthenticationError('Authentication required');
        }

        // Check if user is trying to update their own profile
        if (req.user.id !== userId) {
            throw new AuthorizationError('You can only update your own profile');
        }

        const { name, bio } = req.body;

        const updateData: UpdateProfileData = {};
        if (name !== undefined) {
            updateData.name = name;
        }
        if (bio !== undefined) {
            updateData.bio = bio;
        }

        try {
            const updatedProfile = await this.userService.updateUserProfile(userId, updateData);
            res.status(200).json({
                user: updatedProfile
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to update profile';

            if (message.includes('User not found')) {
                throw new NotFoundError('User not found');
            } else if (message.includes('Bio cannot exceed')) {
                throw new ValidationError('Bio must be 500 characters or less');
            }

            // Re-throw the original error if it doesn't match known patterns
            throw error;
        }
    };

    /**
     * Update own profile (convenience endpoint)
     * PUT /api/users/profile
     */
    updateOwnProfile = async (req: Request, res: Response): Promise<void> => {
        // Check if user is authenticated
        if (!req.user) {
            throw new AuthenticationError('Authentication required');
        }

        const userId = req.user.id;
        const { name, bio } = req.body;
        console.log(name, bio);

        const updateData: UpdateProfileData = {};
        if (name) {
            updateData.name = name;
        }
        if (bio) {
            updateData.bio = bio;
        }

        try {
            const updatedProfile = await this.userService.updateUserProfile(userId, updateData);
            res.status(200).json(updatedProfile);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to update profile';

            if (message.includes('User not found')) {
                throw new NotFoundError('User not found');
            } else if (message.includes('Bio cannot exceed')) {
                throw new ValidationError('Bio must be 500 characters or less');
            }

            // Re-throw the original error if it doesn't match known patterns
            throw error;
        }
    };

    /**
     * Get all users (for suggestions)
     * GET /api/users
     */
    getAllUsers = async (req: Request, res: Response): Promise<void> => {
        const requestingUserId = req.user?.id;
        const users = await this.userService.getAllUsers(requestingUserId);
        res.status(200).json(users);
    };
}