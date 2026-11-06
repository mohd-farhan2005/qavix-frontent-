import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { JsonLd } from '@/components/seo/JsonLd';
import { fetchBlogBySlug } from '@/lib/blog-api';
import { SITE_URL } from '@/lib/seo';
import { reveal, stagger } from '@/lib/reveal';

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await fetchBlogBySlug(slug);

  if (!result || !result.data) {
    return {
      title: 'Article Not Found',
    };
  }

  const { data: blog, seo } = result;
  const pageTitle = seo?.title || `${blog.title} — QAVYX Blog`;
  const pageDescription = seo?.description || blog.excerpt;
  const canonicalUrl = seo?.canonical || `${SITE_URL}/blog/${blog.slug}`;
  const ogImage = seo?.openGraph?.image || blog.featured_image || undefined;

  return {
    title: pageTitle,
    description: pageDescription,
    keywords: seo?.keywords,
    robots: seo?.robots || 'index, follow',
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: 'article',
      title: seo?.openGraph?.title || pageTitle,
      description: seo?.openGraph?.description || pageDescription,
      url: canonicalUrl,
      images: ogImage ? [ogImage] : undefined,
      publishedTime: seo?.openGraph?.publishedTime || blog.published_at,
      modifiedTime: seo?.openGraph?.modifiedTime,
      section: seo?.openGraph?.section || blog.category?.name,
      tags: seo?.openGraph?.tags || blog.tags,
    },
    twitter: {
      card: (seo?.twitter?.card as 'summary_large_image' | 'summary') || 'summary_large_image',
      title: seo?.twitter?.title || pageTitle,
      description: seo?.twitter?.description || pageDescription,
      images: seo?.twitter?.image ? [seo.twitter.image] : ogImage ? [ogImage] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const result = await fetchBlogBySlug(slug);

  if (!result || !result.data) {
    notFound();
  }

  const { data: blog, related = [], seo } = result;

  const authorName = blog.author_name || blog.author?.name || 'QAVYX Editorial Team';
  const formattedDate = blog.published_at
    ? new Date(blog.published_at).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  // JSON-LD Structured Data Schema
  const articleJsonLd = seo?.schema || {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: blog.title,
    description: blog.excerpt,
    image: blog.featured_image ? [blog.featured_image] : undefined,
    datePublished: blog.published_at,
    author: {
      '@type': 'Person',
      name: authorName,
    },
    publisher: {
      '@type': 'Organization',
      name: 'QAVYX',
      url: SITE_URL,
    },
  };

  return (
    <>
      <JsonLd data={articleJsonLd} />

      <main className="bg-qx-black selection:bg-[#2ABD00] selection:text-black min-h-screen">
        <article className="mx-auto max-w-[860px] px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16">
          {/* ==============================================================
              TOP BREADCRUMB / BACK LINK
              ============================================================== */}
          <div {...reveal} className="mb-6 sm:mb-8">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-[#919A94] text-xs font-mono uppercase tracking-[0.2em] hover:text-[#2ABD00] transition-colors"
            >
              <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-[2.2]" viewBox="0 0 24 24">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              <span>Back to All Articles</span>
            </Link>
          </div>

          {/* ==============================================================
              ARTICLE HEADER
              ============================================================== */}
          <header {...reveal} className="mb-8 sm:mb-10">
            {/* Category Pill */}
            {blog.category?.name && (
              <div data-rv style={stagger(0)} className="mb-3 sm:mb-4">
                <span className="inline-flex items-center px-3 py-1 rounded-md border border-[#2ABD00]/60 bg-[#2ABD00]/10 text-xs font-mono uppercase tracking-[0.2em] text-[#2ABD00] shadow-[0_0_10px_rgba(42,189,0,0.3)]">
                  {blog.category.name}
                </span>
              </div>
            )}

            {/* Title */}
            <h1
              data-rv
              style={stagger(1)}
              className="qx-display text-2xl xs:text-3xl sm:text-4xl md:text-[2.75rem] font-bold tracking-tight text-white leading-[1.2] mb-4 sm:mb-6"
            >
              {blog.title}
            </h1>

            {/* Metadata Bar */}
            <div
              data-rv
              style={stagger(2)}
              className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3 px-4 rounded-xl border border-white/10 bg-[#06180a]/60 backdrop-blur-md text-xs font-mono text-[#919A94]"
            >
              <div className="flex items-center gap-1.5 text-white">
                <span className="text-[#919A94]">By</span>
                <span className="font-semibold text-white/95">{authorName}</span>
              </div>
              <span className="w-1 h-1 rounded-full bg-[#2ABD00]" />
              <span>{formattedDate}</span>
              <span className="w-1 h-1 rounded-full bg-[#2ABD00]" />
              <span>{blog.reading_time || 5} min read</span>
              {blog.views_count !== undefined && (
                <>
                  <span className="w-1 h-1 rounded-full bg-[#2ABD00]" />
                  <span>{blog.views_count.toLocaleString()} views</span>
                </>
              )}
            </div>
          </header>

          {/* ==============================================================
              FEATURED IMAGE
              ============================================================== */}
          {blog.featured_image && (
            <div
              {...reveal}
              className="mb-8 sm:mb-12 rounded-2xl overflow-hidden border border-white/15 shadow-[0_16px_45px_rgba(0,0,0,0.95)]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={blog.featured_image}
                alt={blog.featured_image_alt || blog.title}
                className="w-full max-h-[460px] object-cover object-center filter contrast-105"
              />
            </div>
          )}

          {/* ==============================================================
              TINYMCE RICH CONTENT
              ============================================================== */}
          <div
            {...reveal}
            className="blog-content mb-10 sm:mb-14"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />

          {/* ==============================================================
              TAGS
              ============================================================== */}
          {blog.tags && blog.tags.length > 0 && (
            <div {...reveal} className="pt-6 pb-8 border-t border-white/10 flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs uppercase tracking-wider text-[#919A94] mr-2">
                Tags:
              </span>
              {blog.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-md border border-white/10 bg-[#061208]/80 text-xs font-mono text-white/80 hover:border-[#2ABD00]/60 hover:text-[#2ABD00] transition-colors"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* ==============================================================
              RELATED ARTICLES
              ============================================================== */}
          {related && related.length > 0 && (
            <section
              aria-labelledby="related-heading"
              {...reveal}
              className="mt-12 pt-10 border-t border-white/10"
            >
              <div className="flex items-center gap-2 mb-6">
                <span className="w-1 h-3.5 bg-[#2ABD00] rounded-full inline-block" />
                <h2
                  id="related-heading"
                  className="font-mono text-xs uppercase tracking-[0.25em] text-white font-bold"
                >
                  RELATED ARTICLES
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {related.map((item) => (
                  <Link
                    key={item.id}
                    href={`/blog/${item.slug}`}
                    className="group flex flex-col justify-between p-4 rounded-xl border border-white/10 bg-gradient-to-b from-[#06180a]/80 via-[#031006]/90 to-[#010602] hover:border-[#2ABD00]/70 hover:shadow-[0_0_16px_rgba(42,189,0,0.25)] transition-all duration-300"
                  >
                    <h3 className="text-sm font-bold text-white group-hover:text-[#2ABD00] transition-colors line-clamp-2 leading-snug mb-3">
                      {item.title}
                    </h3>
                    <div className="flex items-center justify-between text-xs font-mono text-[#2ABD00] mt-auto pt-2 border-t border-white/5">
                      <span>Read article</span>
                      <svg
                        className="w-3.5 h-3.5 stroke-current fill-none stroke-[2] group-hover:translate-x-1 transition-transform"
                        viewBox="0 0 24 24"
                      >
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* ==============================================================
              BOTTOM BACK BUTTON
              ============================================================== */}
          <div {...reveal} className="mt-12 text-center">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-[4px] border border-[#2ABD00]/60 bg-[#06180a]/80 text-[#2ABD00] font-mono text-xs uppercase tracking-[0.25em] font-semibold hover:border-[#2ABD00] hover:bg-[#2ABD00]/15 hover:shadow-[0_0_16px_rgba(42,189,0,0.35)] transition-all duration-300"
            >
              <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-[2.2]" viewBox="0 0 24 24">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              <span>Back to All Articles</span>
            </Link>
          </div>
        </article>
      </main>
    </>
  );
}
