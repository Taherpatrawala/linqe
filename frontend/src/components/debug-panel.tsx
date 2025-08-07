"use client";

import React, { useState } from "react";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/contexts/auth-context";
import { CookieUtils } from "@/lib/cookie-utils";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export function DebugPanel() {
    const [healthStatus, setHealthStatus] = useState<string>("Not checked");
    const [authStatus, setAuthStatus] = useState<string>("Not checked");
    const { user } = useAuth();

    const checkHealth = async () => {
        try {
            const response = await apiClient.healthCheck();
            setHealthStatus(`✅ Backend healthy: ${response.status}`);
        } catch (error) {
            setHealthStatus(`❌ Backend error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    const checkAuth = async () => {
        try {
            const token = apiClient.getToken();
            if (!token) {
                setAuthStatus("❌ No token found");
                return;
            }

            const currentUser = await apiClient.getCurrentUser();
            setAuthStatus(`✅ Auth working: ${currentUser.name} (${currentUser.email})`);
        } catch (error) {
            setAuthStatus(`❌ Auth error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    const testCreatePost = async () => {
        try {
            const post = await apiClient.createPost({ content: "Test post from debug panel" });
            console.log("Post created successfully:", post);
            alert("Post created successfully!");
        } catch (error) {
            console.error("Post creation failed:", error);
            alert(`Post creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    const testCookieOperations = () => {
        const token = CookieUtils.getToken();
        if (token) {
            alert(`Current token (first 20 chars): ${token.substring(0, 20)}...`);
        } else {
            alert('No token found in cookies');
        }
    };

    // Only show in development
    if (process.env.NODE_ENV === 'production') {
        return null;
    }

    return (
        <Card className="mb-4 border-orange-200 bg-orange-50 dark:bg-orange-950 dark:border-orange-800">
            <CardHeader>
                <CardTitle className="text-sm text-orange-800 dark:text-orange-200">
                    🔧 Debug Panel (Development Only)
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                <div className="text-xs space-y-1">
                    <p><strong>Current User:</strong> {user ? `${user.name} (${user.email})` : 'Not logged in'}</p>
                    <p><strong>Token (Cookie):</strong> {CookieUtils.hasToken() ? '✅ Present' : '❌ Missing'}</p>
                    <p><strong>Token (API Client):</strong> {apiClient.getToken() ? '✅ Present' : '❌ Missing'}</p>
                    <p><strong>Backend Health:</strong> {healthStatus}</p>
                    <p><strong>Auth Status:</strong> {authStatus}</p>
                </div>

                <div className="flex gap-2 flex-wrap">
                    <Button size="sm" variant="outline" onClick={checkHealth}>
                        Check Backend
                    </Button>
                    <Button size="sm" variant="outline" onClick={checkAuth}>
                        Check Auth
                    </Button>
                    <Button size="sm" variant="outline" onClick={testCookieOperations}>
                        Test Cookies
                    </Button>
                    {user && (
                        <Button size="sm" variant="outline" onClick={testCreatePost}>
                            Test Post
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}