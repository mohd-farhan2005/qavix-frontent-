'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { API_BASE_URL, BlogSeo } from '@/lib/blog-api';

interface BackendSeoData extends BlogSeo {
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  canonical_url?: string;
  og_title?: string;
  og_description?: string;
  og_image?: string;
  schema_markup?: Record<string, unknown>;
}

/**
 * Hook to automatically retrieve dynamic SEO configuration from the backend
 * for the current route path (e.g. GET /api/seo?path=/...).
 * Dynamically updates document.title, description, and schema markup in client rendering.
 */
export function usePageSeo(customPath?: string): BlogSeo | null {
  const currentPathname = usePathname();
  const routePath = customPath || currentPathname || '/';
  const [seo, setSeo] = useState<BlogSeo | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch(`${API_BASE_URL}/seo?path=${encodeURIComponent(routePath)}`, {
      signal: AbortSignal.timeout(8000),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data && data.success && data.data) {
          const seoData: BackendSeoData = data.data;
          setSeo(seoData);

          // Update Document Title
          const title = seoData.meta_title || seoData.title;
          if (title && typeof document !== 'undefined') {
            document.title = title;
          }

          // Update Meta Description
          const description = seoData.meta_description || seoData.description;
          if (description && typeof document !== 'undefined') {
            let descMeta = document.querySelector('meta[name="description"]');
            if (!descMeta) {
              descMeta = document.createElement('meta');
              descMeta.setAttribute('name', 'description');
              document.head.appendChild(descMeta);
            }
            descMeta.setAttribute('content', description);
          }

          // Inject Schema.org markup
          const schema = seoData.schema_markup || seoData.schema;
          if (schema && typeof document !== 'undefined') {
            let schemaScript = document.getElementById('page-schema-jsonld');
            if (!schemaScript) {
              schemaScript = document.createElement('script');
              schemaScript.id = 'page-schema-jsonld';
              schemaScript.setAttribute('type', 'application/ld+json');
              document.head.appendChild(schemaScript);
            }
            schemaScript.textContent = JSON.stringify(schema);
          }
        }
      })
      .catch((err) => {
        console.warn('[usePageSeo] Notice:', err.message);
      });

    return () => {
      cancelled = true;
    };
  }, [routePath]);

  return seo;
}

export default usePageSeo;
