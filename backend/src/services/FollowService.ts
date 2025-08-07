import { EntityManager } from '@mikro-orm/core';
import { User } from '../entities/User';
import { Follow } from '../entities/Follow';

export interface FollowResponse {
    isFollowing: boolean;
    followersCount: number;
    followingCount: number;
}

export class FollowService {
    constructor(private em: EntityManager) { }

    /**
     * Follow a user
     */
    async followUser(followerId: number, followingId: number): Promise<FollowResponse> {
        if (followerId === followingId) {
            throw new Error('Cannot follow yourself');
        }

        const follower = await this.em.findOne(User, { id: followerId });
        const following = await this.em.findOne(User, { id: followingId });

        if (!follower || !following) {
            throw new Error('User not found');
        }

        // Check if already following
        const existingFollow = await this.em.findOne(Follow, {
            follower: follower,
            following: following,
        });

        if (existingFollow) {
            throw new Error('Already following this user');
        }

        // Create follow relationship
        const follow = new Follow();
        follow.follower = follower;
        follow.following = following;

        await this.em.persistAndFlush(follow);

        return this.getFollowStatus(followerId, followingId);
    }

    /**
     * Unfollow a user
     */
    async unfollowUser(followerId: number, followingId: number): Promise<FollowResponse> {
        const follower = await this.em.findOne(User, { id: followerId });
        const following = await this.em.findOne(User, { id: followingId });

        if (!follower || !following) {
            throw new Error('User not found');
        }

        const existingFollow = await this.em.findOne(Follow, {
            follower: follower,
            following: following,
        });

        if (!existingFollow) {
            throw new Error('Not following this user');
        }

        await this.em.removeAndFlush(existingFollow);

        return this.getFollowStatus(followerId, followingId);
    }

    /**
     * Get follow status between two users
     */
    async getFollowStatus(followerId: number, followingId: number): Promise<FollowResponse> {
        const follower = await this.em.findOne(User, { id: followerId });
        const following = await this.em.findOne(User, { id: followingId });

        if (!follower || !following) {
            throw new Error('User not found');
        }

        // Check if following
        const isFollowing = await this.em.findOne(Follow, {
            follower: follower,
            following: following,
        });

        // Get counts
        const followersCount = await this.em.count(Follow, { following: following });
        const followingCount = await this.em.count(Follow, { follower: following });

        return {
            isFollowing: !!isFollowing,
            followersCount,
            followingCount,
        };
    }

    /**
     * Get users that a user is following
     */
    async getFollowing(userId: number): Promise<User[]> {
        const follows = await this.em.find(Follow,
            { follower: { id: userId } },
            { populate: ['following'] }
        );

        return follows.map(follow => follow.following);
    }

    /**
     * Get users that follow a user
     */
    async getFollowers(userId: number): Promise<User[]> {
        const follows = await this.em.find(Follow,
            { following: { id: userId } },
            { populate: ['follower'] }
        );

        return follows.map(follow => follow.follower);
    }

    /**
     * Get follow status for multiple users (for suggestions)
     */
    async getMultipleFollowStatus(followerId: number, userIds: number[]): Promise<Map<number, boolean>> {
        const follows = await this.em.find(Follow, {
            follower: { id: followerId },
            following: { id: { $in: userIds } }
        });

        const followMap = new Map<number, boolean>();
        userIds.forEach(id => followMap.set(id, false));
        follows.forEach(follow => followMap.set(follow.following.id, true));

        return followMap;
    }
}