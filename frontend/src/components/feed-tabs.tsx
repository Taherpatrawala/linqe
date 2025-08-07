"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface FeedTabsProps {
    activeTab: "all" | "following";
    onTabChange: (tab: "all" | "following") => void;
}

export function FeedTabs({ activeTab, onTabChange }: FeedTabsProps) {
    return (
        <Card className="p-1">
            <div className="flex space-x-1">
                <Button
                    variant={activeTab === "all" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => onTabChange("all")}
                    className="flex-1"
                >
                    All Posts
                </Button>
                <Button
                    variant={activeTab === "following" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => onTabChange("following")}
                    className="flex-1"
                >
                    Following
                </Button>
            </div>
        </Card>
    );
}