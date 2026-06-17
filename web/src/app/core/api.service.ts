import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './config';
import {
  BlogPostDetail,
  BlogPostSummary,
  ContactSubmission,
  CreateContact,
  Project,
  SaveBlogPost,
  SaveProject,
} from './models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly base = API_BASE_URL;

  // ---------- Blog (public) ----------
  getPosts(tag?: string): Observable<BlogPostSummary[]> {
    const q = tag ? `?tag=${encodeURIComponent(tag)}` : '';
    return this.http.get<BlogPostSummary[]>(`${this.base}/api/posts${q}`);
  }
  getPost(slug: string): Observable<BlogPostDetail> {
    return this.http.get<BlogPostDetail>(`${this.base}/api/posts/${slug}`);
  }

  // ---------- Blog (admin) ----------
  getAllPosts(): Observable<BlogPostSummary[]> {
    return this.http.get<BlogPostSummary[]>(`${this.base}/api/posts/admin`);
  }
  getPostById(id: string): Observable<BlogPostDetail> {
    return this.http.get<BlogPostDetail>(`${this.base}/api/posts/admin/${id}`);
  }
  createPost(body: SaveBlogPost): Observable<BlogPostDetail> {
    return this.http.post<BlogPostDetail>(`${this.base}/api/posts/admin`, body);
  }
  updatePost(id: string, body: SaveBlogPost): Observable<BlogPostDetail> {
    return this.http.put<BlogPostDetail>(`${this.base}/api/posts/admin/${id}`, body);
  }
  deletePost(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/api/posts/admin/${id}`);
  }

  // ---------- Projects ----------
  getProjects(featured?: boolean): Observable<Project[]> {
    const q = featured ? '?featured=true' : '';
    return this.http.get<Project[]>(`${this.base}/api/projects${q}`);
  }
  getProject(slug: string): Observable<Project> {
    return this.http.get<Project>(`${this.base}/api/projects/${slug}`);
  }
  getProjectById(id: string): Observable<Project> {
    return this.http.get<Project>(`${this.base}/api/projects/admin/${id}`);
  }
  createProject(body: SaveProject): Observable<Project> {
    return this.http.post<Project>(`${this.base}/api/projects/admin`, body);
  }
  updateProject(id: string, body: SaveProject): Observable<Project> {
    return this.http.put<Project>(`${this.base}/api/projects/admin/${id}`, body);
  }
  deleteProject(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/api/projects/admin/${id}`);
  }

  // ---------- Contact ----------
  submitContact(body: CreateContact): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.base}/api/contact`, body);
  }
  getMessages(): Observable<ContactSubmission[]> {
    return this.http.get<ContactSubmission[]>(`${this.base}/api/contact/admin`);
  }
  markMessageRead(id: string): Observable<void> {
    return this.http.patch<void>(`${this.base}/api/contact/admin/${id}/read`, {});
  }
  deleteMessage(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/api/contact/admin/${id}`);
  }

  // ---------- Assets ----------
  uploadAsset(file: File, prefix = 'uploads'): Observable<{ url: string }> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<{ url: string }>(
      `${this.base}/api/assets/upload?prefix=${encodeURIComponent(prefix)}`,
      form,
    );
  }
}
