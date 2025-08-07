"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User } from "@/types";
import { UserPlus, Eye } from "lucide-react";

export function SuggestedUsers() {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [followingUsers, setFollowingUsers] = useState<Set<number>>(new Set());

    useEffect(() => {
        loadSuggestedUsers();
    }, []);

    const loadSuggestedUsers = async () => {
        try {
            setIsLoading(true);
            const allUsers = await apiClient.getAllUsers();
            setUsers(allUsers.slice(0, 5)); // Show only first 5 users

            // Initialize following state from API data
            const initialFollowing = new Set<number>();
            allUsers.forEach(user => {
                if (user.isFollowing) {
                    initialFollowing.add(user.id);
                }
            });
            setFollowingUsers(initialFollowing);
        } catch (error) {
            console.error("Failed to load suggested users:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFollow = async (userId: number) => {
        try {
            await apiClient.followUser(userId);
            setFollowingUsers(prev => new Set([...prev, userId]));

            // Update the user in the list to reflect new follower count
            setUsers(prev => prev.map(user =>
                user.id === userId
                    ? { ...user, isFollowing: true, followersCount: (user.followersCount || 0) + 1 }
                    : user
            ));
        } catch (error) {
            console.error("Failed to follow user:", error);
        }
    };

    const handleUnfollow = async (userId: number) => {
        try {
            await apiClient.unfollowUser(userId);
            setFollowingUsers(prev => {
                const newSet = new Set(prev);
                newSet.delete(userId);
                return newSet;
            });

            // Update the user in the list to reflect new follower count
            setUsers(prev => prev.map(user =>
                user.id === userId
                    ? { ...user, isFollowing: false, followersCount: Math.max((user.followersCount || 1) - 1, 0) }
                    : user
            ));
        } catch (error) {
            console.error("Failed to unfollow user:", error);
        }
    };

    if (isLoading) {
        return (
            <Card className="sticky top-4">
                <CardHeader>
                    <CardTitle className="text-lg">Suggested for you</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center space-x-3 animate-pulse">
                                <div className="h-12 w-12 rounded-full bg-muted"></div>
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-muted rounded w-3/4"></div>
                                    <div className="h-3 bg-muted rounded w-1/2"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="sticky top-4">
            <CardHeader>
                <CardTitle className="text-lg">Suggested for you</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {users.map((suggestedUser) => (
                        <div key={suggestedUser.id} className="flex items-start space-x-3">
                            {/* User avatar */}
                            <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold flex-shrink-0">
                                {suggestedUser.name?.charAt(0)?.toUpperCase() || "?"}
                            </div>

                            {/* User info and actions */}
                            <div className="flex-1 min-w-0">
                                <div className="space-y-1">
                                    <Link
                                        href={`/profile/${suggestedUser.id}`}
                                        className="font-medium hover:underline block truncate"
                                    >
                                        {suggestedUser.name}
                                    </Link>
                                    {suggestedUser.bio && (
                                        <p className="text-xs text-muted-foreground line-clamp-2">
                                            {suggestedUser.bio}
                                        </p>
                                    )}
                                    {suggestedUser.followersCount !== undefined && (
                                        <p className="text-xs text-muted-foreground">
                                            {suggestedUser.followersCount} followers
                                        </p>
                                    )}
                                </div>

                                {/* Action buttons */}
                                <div className="flex space-x-2 mt-2">
                                    <Link href={`/profile/${suggestedUser.id}`}>
                                        <Button variant="ghost" size="sm" className="h-7 px-2">
                                            <Eye className="h-3 w-3 mr-1" />
                                            View
                                        </Button>
                                    </Link>

                                    {followingUsers.has(suggestedUser.id) ? (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-7 px-2"
                                            onClick={() => handleUnfollow(suggestedUser.id)}
                                        >
                                            Following
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="default"
                                            size="sm"
                                            className="h-7 px-2"
                                            onClick={() => handleFollow(suggestedUser.id)}
                                        >
                                            <UserPlus className="h-3 w-3 mr-1" />
                                            Follow
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Show more link */}
                <div className="mt-4 pt-3 border-t">
                    <Button variant="ghost" size="sm" className="w-full text-sm">
                        Show more suggestions
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}