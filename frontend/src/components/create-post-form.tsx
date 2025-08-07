"use client";

import React, { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Post } from "@/types";

interface CreatePostFormProps {
  onPostCreated: (post: Post) => void;
}

export function CreatePostForm({ onPostCreated }: CreatePostFormProps) {
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { user } = useAuth();
  const maxLength = 500;
  const remainingChars = maxLength - content.length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsLoading(true);
    setError("");

    try {
      const post = await apiClient.createPost({ content: content.trim() });
      onPostCreated(post);
      setContent("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create post");
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Card className="border-orange-200 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-orange-950/20 dark:via-amber-950/20 dark:to-yellow-950/20 dark:border-orange-800">
      <CardHeader>
        <h3 className="text-lg font-semibold text-orange-800 dark:text-orange-200">
          What&apos;s on your mind, {user.name}?
        </h3>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-destructive-foreground bg-destructive/10 border border-destructive/20 rounded-md">
              {error}
            </div>
          )}
          <Textarea
            placeholder="Share your thoughts..."
            value={content}
            onChange={(e) => {
              if (e.target.value.length <= maxLength) {
                setContent(e.target.value);
              }
            }}
            disabled={isLoading}
            rows={3}
            className="resize-none"
          />
          <div className="flex justify-between items-center text-sm">
            <span
              className={`${remainingChars < 50
                ? remainingChars < 0
                  ? "text-destructive"
                  : "text-orange-500"
                : "text-muted-foreground"
                }`}
            >
              {remainingChars} characters remaining
            </span>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            disabled={isLoading || !content.trim() || remainingChars < 0}
            className="ml-auto"
          >
            {isLoading ? "Posting..." : "Post"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
