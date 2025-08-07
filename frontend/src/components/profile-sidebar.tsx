"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Edit } from "lucide-react";

export function ProfileSidebar() {
    const { user } = useAuth();

    if (!user) return null;

    return (
        <Card className="sticky top-4">
            <CardHeader className="text-center pb-2">
                {/* Cover photo placeholder */}
                <div className="h-16 bg-gradient-to-r from-primary/20 to-primary/40 rounded-t-lg -mx-6 -mt-6 mb-4"></div>

                {/* Profile picture */}
                <div className="relative -mt-8 mb-2">
                    <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold mx-auto border-4 border-background">
                        {user.name?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                </div>

                {/* User info */}
                <div className="space-y-1">
                    <h3 className="font-semibold text-lg">{user.name}</h3>
                    {user.bio && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                            {user.bio}
                        </p>
                    )}
                </div>
            </CardHeader>

            <CardContent className="space-y-3">
                {/* Profile stats */}
                <div className="border-t pt-3">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Profile views</span>
                        <span className="font-medium text-primary">12</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                        <span className="text-muted-foreground">Post impressions</span>
                        <span className="font-medium text-primary">48</span>
                    </div>
                </div>

                {/* Quick actions */}
                <div className="border-t pt-3 space-y-2">
                    <Link href={`/profile/${user.id}`} className="block">
                        <Button variant="outline" size="sm" className="w-full justify-start">
                            <User className="h-4 w-4 mr-2" />
                            View Profile
                        </Button>
                    </Link>
                    <Link href={`/profile/${user.id}`} className="block">
                        <Button variant="ghost" size="sm" className="w-full justify-start">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Profile
                        </Button>
                    </Link>
                </div>

                {/* Premium/Pro section placeholder */}
                <div className="border-t pt-3">
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 p-3 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-2">
                            Strengthen your profile with AI
                        </p>
                        <Button variant="outline" size="sm" className="w-full text-xs">
                            Try Premium for free
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}