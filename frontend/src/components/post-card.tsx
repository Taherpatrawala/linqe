"use client";

import React from "react";
import Link from "next/link";
import { Post } from "@/types";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

      if (diffInSeconds < 60) return "just now";
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
      if (diffInSeconds < 86400)
        return `${Math.floor(diffInSeconds / 3600)}h ago`;
      if (diffInSeconds < 2592000)
        return `${Math.floor(diffInSeconds / 86400)}d ago`;

      return date.toLocaleDateString();
    } catch {
      return "Unknown date";
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
              {post?.author?.name?.charAt(0)?.toUpperCase() || "?"}
            </div>
            <div className="min-w-0 flex-1">
              <Link
                href={`/profile/${post?.author?.id || 0}`}
                className="font-medium hover:underline block truncate"
              >
                {post?.author?.name || "Unknown User"}
              </Link>
              <p className="text-sm text-muted-foreground">
                {formatDate(post?.createdAt || new Date().toISOString())}
              </p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words overflow-wrap-anywhere">
          {post?.content || "No content"}
        </p>
      </CardContent>
    </Card>
  );
}
