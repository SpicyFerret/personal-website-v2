export interface BlogPostSummary {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImageUrl?: string | null;
  isPublished: boolean;
  publishedAt?: string | null;
  tags: string[];
}

export interface BlogPostDetail extends BlogPostSummary {
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface SaveBlogPost {
  title: string;
  excerpt: string;
  content: string;
  slug?: string | null;
  coverImageUrl?: string | null;
  isPublished: boolean;
  tags?: string[];
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  summary: string;
  description: string;
  repoUrl?: string | null;
  liveUrl?: string | null;
  coverImageUrl?: string | null;
  techStack: string[];
  isFeatured: boolean;
  sortOrder: number;
}

export interface SaveProject {
  title: string;
  summary: string;
  description: string;
  slug?: string | null;
  repoUrl?: string | null;
  liveUrl?: string | null;
  coverImageUrl?: string | null;
  techStack?: string[];
  isFeatured: boolean;
  sortOrder: number;
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  subject?: string | null;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface CreateContact {
  name: string;
  email: string;
  subject?: string | null;
  message: string;
}

export interface LoginResponse {
  token: string;
  expiresAt: string;
  displayName: string;
  email: string;
}
