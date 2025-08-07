import { EntityManager } from '@mikro-orm/core';
import { User } from '../entities/User';
import { Follow } from '../entities/Follow';

export interface UpdateProfileData {
    name?: string;
    bio?: string;
}

export interface UserProfileResponse {
    id: number;
    email: string;
    name: string;
    bio: string | undefined;
    createdAt: Date;
}

export interface PublicUserProfileResponse {
    id: number;
    name: string;
    bio: string | undefined;
    createdAt: Date;
    isFollowing?: boolean;
    followersCount?: number;
    followingCount?: number;
}

export class UserService {
    constructor(private em: EntityManager) { }

    /**
     * Get user profile by ID with proper data filtering
     * Returns full profile for own profile, public profile for others
     */
    async getUserProfile(userId: number, requestingUserId?: number): Promise<UserProfileResponse | PublicUserProfileResponse | null> {
        const user = await this.em.findOne(User, { id: userId });

        if (!user) {
            return null;
        }

        // If requesting own profile, return full profile including email
        if (requestingUserId && requestingUserId === userId) {
            return {
                id: user.id,
                email: user.email,
                name: user.name,
                bio: user.bio,
                createdAt: user.createdAt,
            };
        }

        // Return public profile (no email) for other users
        return {
            id: user.id,
            name: user.name,
            bio: user.bio,
            createdAt: user.createdAt,
        };
    }

    /**
     * Update user profile with bio validation
     */
    async updateUserProfile(userId: number, data: UpdateProfileData): Promise<UserProfileResponse> {
        const user = await this.em.findOne(User, { id: userId });

        if (!user) {
            throw new Error('User not found');
        }

        // Update name if provided
        if (data.name !== undefined) {
            const trimmedName = data.name.trim();
            if (trimmedName === '') {
                throw new Error('Name cannot be empty');
            }
            if (trimmedName.length > 100) {
                throw new Error('Name cannot exceed 100 characters');
            }
            user.name = trimmedName;
        }

        // Validate bio if provided
        if (data.bio !== undefined) {
            if (data.bio.length > 500) {
                throw new Error('Bio cannot exceed 500 characters');
            }
            const trimmedBio = data.bio.trim();
            if (trimmedBio === '') {
                delete user.bio;
            } else {
                user.bio = trimmedBio;
            }
        }

        await this.em.persistAndFlush(user);

        return {
            id: user.id,
            email: user.email,
            name: user.name,
            bio: user.bio,
            createdAt: user.createdAt,
        };
    }

    /**
     * Check if user exists by ID
     */
    async userExists(userId: number): Promise<boolean> {
        const user = await this.em.findOne(User, { id: userId });
        return !!user;
    }

    /**
     * Get all users (for suggestions) - returns public profiles only
     */
    async getAllUsers(requestingUserId?: number): Promise<PublicUserProfileResponse[]> {
        const users = await this.em.find(User, {}, {
            orderBy: { createdAt: 'DESC' },
            limit: 20 // Limit to prevent too many results
        });

        const filteredUsers = users.filter(user => user.id !== requestingUserId);

        // If no requesting user, return basic info
        if (!requestingUserId) {
            return filteredUsers.map(user => ({
                id: user.id,
                name: user.name,
                bio: user.bio,
                createdAt: user.createdAt,
            }));
        }

        // Get follow status for all users
        const userIds = filteredUsers.map(user => user.id);
        const follows = await this.em.find(Follow, {
            follower: { id: requestingUserId },
            following: { id: { $in: userIds } }
        });

        const followMap = new Map<number, boolean>();
        follows.forEach(follow => followMap.set(follow.following.id, true));

        // Get follower counts for all users
        const followerCounts = await Promise.all(
            filteredUsers.map(async (user) => {
                const count = await this.em.count(Follow, { following: { id: user.id } });
                return { userId: user.id, count };
            })
        );

        const followerCountMap = new Map<number, number>();
        followerCounts.forEach(({ userId, count }) => followerCountMap.set(userId, count));

        return filteredUsers.map(user => ({
            id: user.id,
            name: user.name,
            bio: user.bio,
            createdAt: user.createdAt,
            isFollowing: followMap.get(user.id) || false,
            followersCount: followerCountMap.get(user.id) || 0,
        }));
    }
}