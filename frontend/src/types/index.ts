export interface User {
  id: number;
  email: string;
  name: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
  isFollowing?: boolean;
  followersCount?: number;
  followingCount?: number;
}

export interface Post {
  id: number;
  content: string;
  author: User;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  bio?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface CreatePostData {
  content: string;
}

export interface UpdateProfileData {
  name?: string;
  bio?: string;
}
