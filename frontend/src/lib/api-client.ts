import {
  User,
  Post,
  LoginCredentials,
  RegisterData,
  AuthResponse,
  CreatePostData,
  UpdateProfileData,
} from "@/types";
import { CookieUtils } from "./cookie-utils";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    // Try to get token from cookies on client side
    if (typeof window !== "undefined") {
      this.token = CookieUtils.getToken() || null;
    }
  }

  // Method to refresh token from cookies
  private refreshToken() {
    if (typeof window !== "undefined") {
      this.token = CookieUtils.getToken() || null;
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // Refresh token from cookies before each request
    this.refreshToken();

    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    // Debug logging for auth issues (only for critical endpoints)
    if (endpoint.includes('/posts') && !this.token) {
      console.warn('Making request to posts endpoint without token');
    }

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: `HTTP error! status: ${response.status}`,
        }));

        // Handle unauthorized errors specifically
        if (response.status === 401) {
          this.setToken(null);
          throw new Error('Authentication required. Please log in again.');
        }

        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Unable to connect to server. Please check your connection.');
      }
      throw error;
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== "undefined") {
      if (token) {
        CookieUtils.setToken(token);
      } else {
        CookieUtils.removeToken();
      }
    }
  }

  getToken(): string | null {
    return this.token;
  }

  // Auth endpoints
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
    // Ensure token is set immediately
    if (response.token) {
      this.setToken(response.token);
    }
    return response;
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
    // Ensure token is set immediately
    if (response.token) {
      this.setToken(response.token);
    }
    return response;
  }

  async logout(): Promise<void> {
    await this.request("/api/auth/logout", {
      method: "POST",
    });
    this.setToken(null);
  }

  async getCurrentUser(): Promise<User> {
    return this.request<User>("/api/auth/me");
  }

  // Posts endpoints
  async getPosts(): Promise<Post[]> {
    return this.request<Post[]>("/api/posts");
  }

  async getFollowingPosts(): Promise<Post[]> {
    return this.request<Post[]>("/api/posts/following");
  }

  async createPost(data: CreatePostData): Promise<Post> {
    return this.request<Post>("/api/posts", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Users endpoints
  async getUserProfile(userId: number): Promise<User> {
    return this.request<User>(`/api/users/${userId}`);
  }

  async getUserPosts(userId: number): Promise<Post[]> {
    return this.request<Post[]>(`/api/users/${userId}/posts`);
  }

  async updateProfile(data: UpdateProfileData): Promise<User> {
    return this.request<User>("/api/users/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async getAllUsers(): Promise<User[]> {
    return this.request<User[]>("/api/users");
  }

  // Follow endpoints
  async followUser(userId: number): Promise<{ isFollowing: boolean; followersCount: number; followingCount: number }> {
    return this.request(`/api/follows/${userId}`, {
      method: "POST",
    });
  }

  async unfollowUser(userId: number): Promise<{ isFollowing: boolean; followersCount: number; followingCount: number }> {
    return this.request(`/api/follows/${userId}`, {
      method: "DELETE",
    });
  }

  async getFollowStatus(userId: number): Promise<{ isFollowing: boolean; followersCount: number; followingCount: number }> {
    return this.request(`/api/follows/${userId}/status`);
  }

  // Health check method
  async healthCheck(): Promise<{ status: string }> {
    return this.request<{ status: string }>("/api/health", {
      method: "GET",
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
