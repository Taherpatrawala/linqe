"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { apiClient } from "@/lib/api-client";
import { Navigation } from "@/components/navigation";
import { PostCard } from "@/components/post-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Post } from "@/types";
import { Edit, Save, X } from "lucide-react";

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser, updateUser, isLoading: authLoading } = useAuth();

  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", bio: "" });
  const [error, setError] = useState("");

  const userId = parseInt(params.id as string, 10);
  const isOwnProfile = currentUser?.id === userId;

  const loadProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");

      const [user, userPosts] = await Promise.all([
        apiClient.getUserProfile(userId),
        apiClient.getUserPosts(userId),
      ]);

      console.log(user, userPosts);

      setProfileUser(user);
      setPosts(Array.isArray(userPosts) ? userPosts : []);
      setEditForm({ name: user?.name || "", bio: user?.bio || "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);
  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.push("/login");
      return;
    }

    if (currentUser) {
      loadProfile();
    }
  }, [currentUser, authLoading, router, loadProfile]);



  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileUser) return;

    try {
      const updatedUser = await apiClient.updateProfile(editForm);
      setProfileUser(updatedUser);
      updateUser(updatedUser);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading profile...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-destructive">{error}</p>
            <button
              onClick={loadProfile}
              className="mt-2 text-primary hover:underline"
            >
              Try again
            </button>
          </div>
        ) : profileUser ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Info */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader className="text-center">
                  <div className="h-24 w-24 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-3xl font-bold mx-auto mb-4">
                    {profileUser?.name?.charAt(0)?.toUpperCase() || "?"}
                  </div>

                  {isEditing ? (
                    <form onSubmit={handleEditSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          value={editForm.name}
                          onChange={(e) =>
                            setEditForm((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }))
                          }
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          value={editForm.bio}
                          onChange={(e) =>
                            setEditForm((prev) => ({
                              ...prev,
                              bio: e.target.value,
                            }))
                          }
                          rows={3}
                        />
                      </div>

                      <div className="flex space-x-2">
                        <Button type="submit" size="sm" className="flex-1">
                          <Save className="h-4 w-4 mr-2" />
                          Save
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setIsEditing(false)}
                          className="flex-1"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <CardTitle className="text-xl">
                        {profileUser?.name || "Unknown User"}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {profileUser?.email || "No email"}
                      </p>
                      {profileUser?.bio && (
                        <p className="text-sm mt-2">{profileUser.bio}</p>
                      )}

                      {isOwnProfile && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsEditing(true)}
                          className="mt-4"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Profile
                        </Button>
                      )}
                    </>
                  )}
                </CardHeader>
              </Card>
            </div>

            {/* Posts */}
            <div className="lg:col-span-2">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">
                  {isOwnProfile ? "Your Posts" : `${profileUser?.name || "User"}'s Posts`}
                </h2>

                {posts.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      {isOwnProfile
                        ? "You haven't posted anything yet."
                        : "No posts yet."}
                    </p>
                  </div>
                ) : (
                  posts.map((post) => <PostCard key={post.id} post={post} />)
                )}
              </div>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
