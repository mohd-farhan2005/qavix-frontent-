/**
 * Blog, FAQ, and SEO API service for QAVYX.
 * Connects to the backend at https://qavixbackend-production.up.railway.app/api
 */

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://qavixbackend-production.up.railway.app/api';

const DEFAULT_TIMEOUT_MS = 8000;

export interface BlogCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  blogs_count?: number;
}

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image: string | null;
  featured_image_alt: string | null;
  reading_time: number;
  views_count: number;
  published_at: string;
  author_name?: string;
  author?: {
    id: number;
    name: string;
    email?: string;
  };
  category?: {
    id: number;
    name: string;
    slug: string;
  };
  tags?: string[];
}

export interface BlogListMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from?: number;
  to?: number;
}

export interface BlogSeo {
  title: string;
  description: string;
  keywords?: string;
  robots?: string;
  canonical?: string;
  openGraph?: {
    site_name?: string;
    title: string;
    description: string;
    image?: string;
    type?: string;
    publishedTime?: string;
    modifiedTime?: string;
    section?: string;
    tags?: string[];
  };
  twitter?: {
    card?: string;
    title: string;
    description: string;
    image?: string;
    site?: string;
  };
  schema?: Record<string, unknown>;
  extraMeta?: Array<{ name?: string; property?: string; content: string }>;
}

export interface BlogListResponse {
  success: boolean;
  data: BlogPost[];
  meta: BlogListMeta;
}

export interface BlogDetailResponse {
  success: boolean;
  data: BlogPost;
  related: Pick<BlogPost, 'id' | 'title' | 'slug' | 'excerpt' | 'featured_image'>[];
  seo: BlogSeo;
}

export interface CategoriesResponse {
  success: boolean;
  data: BlogCategory[];
}

export interface PageSeoResponse {
  success: boolean;
  data: BlogSeo & {
    path?: string;
    page_name?: string;
    raw_title?: string;
  };
}

export interface FaqItem {
  id: number;
  question: string;
  answer: string;
  category: string;
  sort_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface FaqsResponse {
  success: boolean;
  total: number;
  categories: Array<{ category: string; count: number }>;
  data: FaqItem[];
  grouped: Record<string, FaqItem[]>;
  schema?: Record<string, unknown>;
}

export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}

export interface ContactResponse {
  success: boolean;
  message: string;
  data?: unknown;
}

/** Safe fetch helper with timeout and graceful error swallowing */
async function safeFetch<T>(
  url: string,
  options: RequestInit = {},
  timeoutMs = DEFAULT_TIMEOUT_MS
): Promise<T | null> {
  try {
    const res = await fetch(url, {
      ...options,
      cache: 'no-store',
      signal: AbortSignal.timeout(timeoutMs),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch (err: unknown) {
    const error = err as Error;
    // Log softly so Next.js dev overlay does not pop up with full-screen errors
    if (error.name === 'TimeoutError' || error.name === 'AbortError') {
      console.warn(`[API Timeout] Backend request to ${url} timed out after ${timeoutMs}ms.`);
    } else {
      console.warn(`[API Notice] Backend request to ${url} was not completed:`, error.message);
    }
    return null;
  }
}

/**
 * Fetch a paginated list of published blogs with optional search and category filters.
 */
export async function fetchBlogList(options: {
  page?: number;
  per_page?: number;
  search?: string;
  category?: string;
  timeoutMs?: number;
} = {}): Promise<{ blogs: BlogPost[]; meta: BlogListMeta }> {
  const { page = 1, per_page = 9, search, category, timeoutMs } = options;
  const params = new URLSearchParams({
    page: String(page),
    per_page: String(per_page),
    ...(search ? { search } : {}),
    ...(category ? { category } : {}),
  });

  const json = await safeFetch<BlogListResponse>(
    `${API_BASE_URL}/blogs?${params.toString()}`,
    {},
    timeoutMs
  );

  if (json && json.success && Array.isArray(json.data)) {
    return {
      blogs: json.data,
      meta: json.meta || { current_page: 1, last_page: 1, per_page, total: json.data.length },
    };
  }

  return { blogs: [], meta: { current_page: 1, last_page: 1, per_page, total: 0 } };
}

/**
 * Fetch all blog categories for filters.
 */
export async function fetchCategories(timeoutMs?: number): Promise<BlogCategory[]> {
  const json = await safeFetch<CategoriesResponse>(
    `${API_BASE_URL}/categories`,
    {},
    timeoutMs
  );
  if (json && json.success && Array.isArray(json.data)) {
    return json.data;
  }
  return [];
}

/**
 * Fetch a single blog by slug with full content and pre-formatted SEO bundle.
 */
export async function fetchBlogBySlug(
  slug: string,
  timeoutMs?: number
): Promise<BlogDetailResponse | null> {
  const json = await safeFetch<BlogDetailResponse>(
    `${API_BASE_URL}/blogs/${encodeURIComponent(slug)}`,
    {},
    timeoutMs
  );
  if (json && json.success && json.data) {
    return json;
  }
  return null;
}

/**
 * Fetch SEO metadata for any route path (e.g. '/', '/who-we-are', '/services', etc.)
 */
export async function fetchPageSeo(
  pathname: string,
  timeoutMs?: number
): Promise<BlogSeo | null> {
  const json = await safeFetch<PageSeoResponse>(
    `${API_BASE_URL}/seo?path=${encodeURIComponent(pathname)}`,
    {},
    timeoutMs
  );
  if (json && json.success && json.data) {
    return json.data;
  }
  return null;
}

/**
 * Fetch active FAQs, grouped by category, with Google FAQPage JSON-LD schema.
 */
export async function fetchFaqs(options: {
  category?: string;
  search?: string;
  limit?: number;
  timeoutMs?: number;
} = {}): Promise<FaqsResponse | null> {
  const { category, search, limit, timeoutMs } = options;
  const params = new URLSearchParams({
    ...(category ? { category } : {}),
    ...(search ? { search } : {}),
    ...(limit ? { limit: String(limit) } : {}),
  });

  const query = params.toString();
  const url = `${API_BASE_URL}/faqs${query ? `?${query}` : ''}`;

  const json = await safeFetch<FaqsResponse>(url, {}, timeoutMs);
  if (json && json.success && Array.isArray(json.data)) {
    return json;
  }
  return null;
}

/**
 * Submit contact lead inquiry to backend.
 */
export async function submitContact(formData: ContactFormData): Promise<ContactResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/contact`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
      signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
    });
    const data = await res.json();
    return data;
  } catch {
    return {
      success: false,
      message: 'Failed to connect to contact service. Please try again.',
    };
  }
}

/**
 * Convenience API client object matching the user documentation.
 */
export const api = {
  getFaqs: (category?: string) => fetchFaqs({ category }),
  getBlogs: (page = 1, category = '', search = '') =>
    fetchBlogList({ page, category, search }),
  getBlogBySlug: (slug: string) => fetchBlogBySlug(slug),
  getFeaturedBlogs: () => safeFetch<BlogListResponse>(`${API_BASE_URL}/blogs/featured`),
  getRecentBlogs: () => safeFetch<BlogListResponse>(`${API_BASE_URL}/blogs/recent`),
  getCategories: () => fetchCategories(),
  getPageSeo: (path: string) => fetchPageSeo(path),
  getGlobalSeo: () => safeFetch<{ success: boolean; data: unknown }>(`${API_BASE_URL}/seo-settings`),
  submitContact: (formData: ContactFormData) => submitContact(formData),
};
