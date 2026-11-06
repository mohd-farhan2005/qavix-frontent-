import type { Metadata } from 'next';
import { JsonLd } from '@/components/seo/JsonLd';
import { BlogListContent } from '@/components/blog/BlogListContent';
import { fetchBlogList, fetchCategories, fetchPageSeo } from '@/lib/blog-api';
import { pageJsonLd, pageMetadata, SITE_URL } from '@/lib/seo';
import { reveal, stagger } from '@/lib/reveal';

const PAGE_NODE = { href: '/blog', label: 'Our Blog & Articles' };
const DEFAULT_DESCRIPTION =
  'Strategic insights, digital growth methodologies, and engineering perspectives from the QAVYX team.';

export async function generateMetadata(): Promise<Metadata> {
  const backendSeo = await fetchPageSeo('/blog');
  if (backendSeo && backendSeo.title) {
    return {
      title: backendSeo.title,
      description: backendSeo.description || DEFAULT_DESCRIPTION,
      keywords: backendSeo.keywords,
      robots: backendSeo.robots || 'index, follow',
      alternates: {
        canonical: backendSeo.canonical || `${SITE_URL}/blog`,
      },
      openGraph: {
        type: 'website',
        title: backendSeo.openGraph?.title || backendSeo.title,
        description: backendSeo.openGraph?.description || backendSeo.description,
        images: backendSeo.openGraph?.image ? [backendSeo.openGraph.image] : undefined,
      },
      twitter: {
        card: (backendSeo.twitter?.card as 'summary_large_image' | 'summary') || 'summary_large_image',
        title: backendSeo.twitter?.title || backendSeo.title,
        description: backendSeo.twitter?.description || backendSeo.description,
        images: backendSeo.twitter?.image ? [backendSeo.twitter.image] : undefined,
      },
    };
  }

  return pageMetadata({
    path: '/blog',
    title: 'Our Blog & Articles',
    description: DEFAULT_DESCRIPTION,
  });
}

export default async function BlogPageRoute() {
  // Pre-fetch initial page of blogs and categories on the server for instant paint
  const [{ blogs, meta }, categories] = await Promise.all([
    fetchBlogList({ page: 1, per_page: 9 }),
    fetchCategories(),
  ]);

  return (
    <>
      <JsonLd
        data={pageJsonLd({
          page: PAGE_NODE,
          description: DEFAULT_DESCRIPTION,
          type: 'CollectionPage',
        })}
      />

      <main className="bg-qx-black selection:bg-[#2ABD00] selection:text-black min-h-screen">
        <article className="mx-auto max-w-[var(--qx-shell)] px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16">
          {/* ==============================================================
              PAGE TITLE & INTRO HEADER
              ============================================================== */}
          <div {...reveal} className="mb-8 sm:mb-12 text-left">
            {/* Eyebrow */}
            <div data-rv style={stagger(0)} className="mb-2.5">
              <span className="font-mono text-xs uppercase tracking-[0.28em] text-[#919A94] font-medium">
                KNOWLEDGE BASE &amp; PERSPECTIVES
              </span>
            </div>

            {/* Main Headline */}
            <h1
              data-rv
              style={stagger(1)}
              className="qx-display text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-[3.1rem] font-bold tracking-tight text-white leading-tight mb-3 sm:mb-4"
            >
              <span>Our Blog &amp; </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2ABD00] via-[#52e825] to-[#2ABD00]">
                Articles.
              </span>
            </h1>

            {/* Description */}
            <p
              data-rv
              style={stagger(2)}
              className="text-xs sm:text-sm md:text-base text-[#919A94] max-w-[640px] font-medium leading-relaxed font-sans"
            >
              Explore actionable marketing playbooks, technical deep-dives into AI automation, and strategic frameworks designed for ambitious enterprises scaling in India, GCC &amp; beyond.
            </p>
          </div>

          {/* ==============================================================
              INTERACTIVE BLOG DIRECTORY (Search, Filter, Cards, Pagination)
              ============================================================== */}
          <BlogListContent
            initialBlogs={blogs}
            initialCategories={categories}
            initialTotalPages={meta.last_page || 1}
          />
        </article>
      </main>
    </>
  );
}
