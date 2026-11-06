import React from 'react';
import Link from 'next/link';
import { reveal, stagger } from '@/lib/reveal';
import { fetchBlogList, BlogPost } from '@/lib/blog-api';

export async function BlogPreview() {
  const { blogs } = await fetchBlogList({ per_page: 3 });

  // If no blogs yet from backend, we display a fallback or null
  if (!blogs || blogs.length === 0) {
    return null;
  }

  return (
    <section
      id="qx-blog"
      aria-labelledby="qx-blog-heading"
      className="mx-auto max-w-[var(--qx-shell)] w-full px-3 sm:px-6 lg:px-8 pt-12 sm:pt-16 md:pt-20 pb-16 sm:pb-20 lg:pb-24 relative overflow-hidden select-none"
    >
      {/* Soft Ambient Green Background Lighting */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] sm:w-[850px] h-[550px] sm:h-[750px] bg-[#2ABD00]/7 rounded-full blur-[150px]" />

      <div {...reveal} className="relative w-full">
        {/* =========================================================================
            SECTION HEADER
            ========================================================================= */}
        <div className="text-center max-w-[54rem] mx-auto mb-8 sm:mb-12 relative z-20 px-4">
          <h2
            id="qx-blog-heading"
            className="qx-display text-[clamp(1.85rem,5.5vw,2.75rem)] font-bold text-white tracking-tight leading-[1.18]"
          >
            Insights &amp;{' '}
            <span className="text-[#2ABD00] drop-shadow-[0_0_24px_rgba(42,189,0,0.7)]">
              Growth Stories
            </span>
            <span className="text-[#2ABD00] drop-shadow-[0_0_10px_#2ABD00]">.</span>
          </h2>
          <div className="w-12 sm:w-16 h-[2px] bg-[#2ABD00] rounded-full mx-auto mt-3.5" />
          <p className="mt-6 md:mt-8 text-[11px] sm:text-xs font-mono uppercase tracking-[0.2em] sm:tracking-[0.22em] text-[#919A94]">
            STRATEGY · AI AUTOMATION · DIGITAL IMPACT
          </p>
        </div>

        {/* =========================================================================
            BLOG CARDS 3-COLUMN GRID
            ========================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 relative z-10">
          {blogs.map((blog: BlogPost, idx: number) => {
            const formattedDate = blog.published_at
              ? new Date(blog.published_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : 'Recent';

            return (
              <article
                key={blog.id}
                data-rv
                style={stagger(idx + 1)}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-b from-[#06180a]/90 via-[#031006]/95 to-[#010602]/98 backdrop-blur-xl shadow-[0_12px_36px_rgba(0,0,0,0.85)] hover:border-[#2ABD00]/70 hover:shadow-[0_16px_45px_rgba(0,0,0,0.95),0_0_28px_rgba(42,189,0,0.3)] transition-all duration-500 ease-out"
              >
                {/* Top specular highlight rim */}
                <div className="pointer-events-none absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/30 group-hover:via-[#2ABD00] to-transparent transition-colors duration-500 z-20" />

                <div>
                  {/* Card Image */}
                  <Link
                    href={`/blog/${blog.slug}`}
                    className="block relative w-full h-[190px] xs:h-[210px] overflow-hidden bg-black"
                  >
                    {blog.featured_image ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={blog.featured_image}
                        alt={blog.featured_image_alt || blog.title}
                        className="w-full h-full object-cover object-center filter contrast-105 brightness-100 group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#061d0b] via-[#031206] to-[#010602] flex items-center justify-center">
                        <svg
                          className="w-12 h-12 text-[#2ABD00]/30"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        >
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                          <line x1="16" y1="13" x2="8" y2="13" />
                          <line x1="16" y1="17" x2="8" y2="17" />
                        </svg>
                      </div>
                    )}
                    {/* Dark gradient overlay for contrast */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#020b04] via-[#020b04]/40 to-transparent pointer-events-none" />

                    {/* Category Floating Pill */}
                    {blog.category?.name && (
                      <div className="absolute top-3 left-3 z-10">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md border border-[#2ABD00]/50 bg-black/75 backdrop-blur-md text-[10px] font-mono uppercase tracking-[0.18em] text-[#2ABD00] shadow-[0_0_8px_rgba(42,189,0,0.35)]">
                          {blog.category.name}
                        </span>
                      </div>
                    )}
                  </Link>

                  {/* Card Content */}
                  <div className="p-4 sm:p-5 flex flex-col gap-2">
                    {/* Title */}
                    <h3 className="text-base sm:text-[17px] font-bold text-white leading-snug tracking-tight group-hover:text-[#2ABD00] transition-colors line-clamp-2">
                      <Link href={`/blog/${blog.slug}`}>
                        {blog.title}
                      </Link>
                    </h3>

                    {/* Excerpt */}
                    {blog.excerpt && (
                      <p className="text-xs sm:text-[13px] text-[#919A94] font-sans leading-relaxed line-clamp-2">
                        {blog.excerpt}
                      </p>
                    )}
                  </div>
                </div>

                {/* Card Footer: Metadata + Action Button */}
                <div className="px-4 sm:px-5 pb-4 pt-3 border-t border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 text-[10.5px] font-mono text-[#919A94]">
                    <span>{blog.reading_time || 5} min read</span>
                    <span className="w-1 h-1 rounded-full bg-[#2ABD00]" />
                    <span>{formattedDate}</span>
                  </div>

                  <Link
                    href={`/blog/${blog.slug}`}
                    aria-label={`Read ${blog.title}`}
                    className="flex h-[28px] w-[28px] items-center justify-center rounded-md border border-white/20 bg-black/60 text-white/80 group-hover:border-[#2ABD00] group-hover:bg-[#2ABD00]/15 group-hover:text-[#2ABD00] group-hover:shadow-[0_0_10px_rgba(42,189,0,0.4)] transition-all"
                  >
                    <svg
                      className="w-3.5 h-3.5 stroke-current fill-none stroke-[2.2]"
                      viewBox="0 0 24 24"
                    >
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </Link>
                </div>
              </article>
            );
          })}
        </div>

        {/* =========================================================================
            BOTTOM EXPLORE BUTTON
            ========================================================================= */}
        <div data-rv style={stagger(4)} className="mt-10 sm:mt-12 text-center relative z-20">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2.5 px-6 py-2.5 rounded-[4px] border border-[#2ABD00]/60 bg-[#06180a]/80 text-[#2ABD00] font-mono text-xs uppercase tracking-[0.25em] font-semibold hover:border-[#2ABD00] hover:bg-[#2ABD00]/15 hover:shadow-[0_0_20px_rgba(42,189,0,0.4)] transition-all duration-300"
          >
            <span>Explore All Articles</span>
            <svg
              className="w-3.5 h-3.5 stroke-current fill-none stroke-[2.2]"
              viewBox="0 0 24 24"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default BlogPreview;
