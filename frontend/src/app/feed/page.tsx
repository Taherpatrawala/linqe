"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/auth-context";
import { apiClient } from "@/lib/api-client";
import { Navigation } from "@/components/navigation";
import { CreatePostForm } from "@/components/create-post-form";
import { PostCard } from "@/components/post-card";
import { FeedTabs } from "@/components/feed-tabs";
import { ProfileSidebar } from "@/components/profile-sidebar";
import { SuggestedUsers } from "@/components/suggested-users";
import { Post } from "@/types";
import { useRouter } from "next/navigation";

export default function Feed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "following">("all");

  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const loadPosts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(""); // Clear previous errors

      const fetchedPosts = activeTab === "all"
        ? await apiClient.getPosts()
        : await apiClient.getFollowingPosts();

      // Ensure we have an array
      if (Array.isArray(fetchedPosts)) {
        setPosts(fetchedPosts);
      } else {
        console.error("API returned non-array data:", fetchedPosts);
        setPosts([]);
        setError("Invalid data format received from server");
      }
    } catch (err) {
      console.error("Failed to load posts:", err);
      setPosts([]); // Ensure posts is always an array
      setError(err instanceof Error ? err.message : "Failed to load posts");
    } finally {
      setIsLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    if (user) {
      loadPosts();
    }
  }, [user, authLoading, router, loadPosts]);

  // Load posts when tab changes
  useEffect(() => {
    if (user) {
      loadPosts();
    }
  }, [activeTab, user, loadPosts]);



  const handlePostCreated = (newPost: Post) => {
    setPosts((prev) => [newPost, ...prev]);
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

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar - Profile Card (hidden on mobile) */}
          <div className="hidden lg:block lg:col-span-3">
            <ProfileSidebar />
          </div>

          {/* Main Feed */}
          <div className="lg:col-span-6 col-span-1">
            <div className="space-y-6">
              <CreatePostForm onPostCreated={handlePostCreated} />

              <FeedTabs
                activeTab={activeTab}
                onTabChange={setActiveTab}
              />

              <div className="space-y-4">
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-muted-foreground">Loading posts...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-8">
                    <p className="text-destructive">{error}</p>
                    <button
                      onClick={loadPosts}
                      className="mt-2 text-primary hover:underline"
                    >
                      Try again
                    </button>
                  </div>
                ) : posts.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      {activeTab === "all"
                        ? "No posts yet. Be the first to share something!"
                        : "No posts from people you follow yet. Follow some users to see their posts here!"
                      }
                    </p>
                  </div>
                ) : (
                  posts.map((post) => <PostCard key={post.id} post={post} />)
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar - Suggested Users (hidden on mobile) */}
          <div className="hidden lg:block lg:col-span-3">
            <SuggestedUsers />
          </div>
        </div>
      </main>
    </div>
  );
}
