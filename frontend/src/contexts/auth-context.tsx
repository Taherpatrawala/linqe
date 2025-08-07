"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, LoginCredentials, RegisterData } from "@/types";
import { apiClient } from "@/lib/api-client";
import { CookieUtils } from "@/lib/cookie-utils";
import { migrateAuthFromLocalStorage } from "@/lib/migrate-auth";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Migrate any existing localStorage tokens to cookies
    migrateAuthFromLocalStorage();

    // Check if user is logged in on mount
    const checkAuth = async () => {
      try {
        const token = CookieUtils.getToken();
        if (token) {
          const currentUser = await apiClient.getCurrentUser();
          setUser(currentUser);
        }
      } catch {
        // Clear invalid token
        CookieUtils.removeToken();
        apiClient.setToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    const response = await apiClient.login(credentials);
    setUser(response.user);
  };

  const register = async (data: RegisterData) => {
    const response = await apiClient.register(data);
    setUser(response.user);
  };

  const logout = async () => {
    try {
      await apiClient.logout();
    } catch {
      // Continue with logout even if server request fails
    } finally {
      // Clear all auth cookies and user state
      CookieUtils.clearAllAuthCookies();
      setUser(null);
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
