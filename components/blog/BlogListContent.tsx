'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { reveal, stagger } from '@/lib/reveal';
import {
  BlogPost,
  BlogCategory,
  fetchCategories,
  fetchBlogList,
} from '@/lib/blog-api';

interface BlogListContentProps {
  initialBlogs?: BlogPost[];
  initialCategories?: BlogCategory[];
  initialTotalPages?: number;
}

export function BlogListContent({
  initialBlogs = [],
  initialCategories = [],
  initialTotalPages = 1,
}: BlogListContentProps) {
  const [blogs, setBlogs] = useState<BlogPost[]>(initialBlogs);
  const [categories, setCategories] = useState<BlogCategory[]>(initialCategories);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(initialBlogs.length === 0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(initialTotalPages);

  // Debounce search input by 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Load categories if not provided initially
  useEffect(() => {
    if (categories.length === 0) {
      fetchCategories().then((cats) => {
        if (cats && cats.length > 0) {
          setCategories(cats);
        }
      });
    }
  }, [categories.length]);

  // Fetch blogs when page, category, or search changes
  useEffect(() => {
    setLoading(true);
    fetchBlogList({
      page,
      per_page: 9,
      search: debouncedSearch || undefined,
      category: selectedCategory || undefined,
    })
      .then((res) => {
        setBlogs(res.blogs);
        setTotalPages(res.meta.last_page || 1);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching blogs:', err);
        setLoading(false);
      });
  }, [page, debouncedSearch, selectedCategory]);

  return (
    <div className="relative w-full">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute left-1/2 top-40 -translate-x-1/2 w-[700px] sm:w-[900px] h-[500px] bg-[#2ABD00]/6 rounded-full blur-[170px]" />

      {/* ==============================================================
          FILTER & SEARCH TOOLBAR
          ============================================================== */}
      <div {...reveal} className="relative z-20 mb-8 sm:mb-12">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-3 sm:p-4 rounded-xl border border-white/15 bg-gradient-to-r from-[#06180a]/90 via-[#031006]/95 to-[#010602]/98 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
          {/* Search Box */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search articles, insights & guides..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-[42px] rounded-lg border border-white/10 bg-[#061208]/90 pl-10 pr-4 text-xs sm:text-sm text-white placeholder:text-[#919A94] focus:border-[#2ABD00] focus:outline-none focus:shadow-[0_0_12px_rgba(42,189,0,0.3)] transition-all font-sans"
            />
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#2ABD00] pointer-events-none">
              <svg className="w-4 h-4 fill-none stroke-current stroke-[2]" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white text-xs font-mono"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Dropdown (Mobile) & Pills (Desktop) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {/* All button */}
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('');
                setPage(1);
              }}
              className={`shrink-0 px-3.5 py-2 rounded-lg text-xs font-mono uppercase tracking-wider transition-all duration-300 ${
                selectedCategory === ''
                  ? 'border border-[#2ABD00] bg-[#2ABD00]/20 text-[#2ABD00] shadow-[0_0_12px_rgba(42,189,0,0.3)] font-bold'
                  : 'border border-white/10 bg-[#061208]/60 text-[#919A94] hover:text-white hover:border-white/25'
              }`}
            >
              All Articles
            </button>

            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.slug;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat.slug);
                    setPage(1);
                  }}
                  className={`shrink-0 px-3.5 py-2 rounded-lg text-xs font-mono uppercase tracking-wider transition-all duration-300 ${
                    isSelected
                      ? 'border border-[#2ABD00] bg-[#2ABD00]/20 text-[#2ABD00] shadow-[0_0_12px_rgba(42,189,0,0.3)] font-bold'
                      : 'border border-white/10 bg-[#061208]/60 text-[#919A94] hover:text-white hover:border-white/25'
                  }`}
                >
                  {cat.name}
                  {cat.blogs_count !== undefined && (
                    <span className="ml-1.5 opacity-60 text-[10px]">({cat.blogs_count})</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ==============================================================
          BLOG CARDS GRID
          ============================================================== */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-[380px] rounded-2xl border border-white/10 bg-[#061509]/60 animate-pulse flex flex-col p-5"
            >
              <div className="w-full h-[180px] bg-white/5 rounded-xl mb-4" />
              <div className="w-24 h-4 bg-white/10 rounded mb-2" />
              <div className="w-3/4 h-6 bg-white/10 rounded mb-3" />
              <div className="w-full h-12 bg-white/5 rounded mt-auto" />
            </div>
          ))}
        </div>
      ) : blogs.length === 0 ? (
        <div className="p-12 sm:p-16 text-center rounded-2xl border border-white/10 bg-[#06180a]/60 backdrop-blur-xl">
          <div className="w-12 h-12 mx-auto mb-4 text-[#2ABD00]/40 flex items-center justify-center rounded-full border border-white/10 bg-black/40">
            <svg className="w-6 h-6 fill-none stroke-current stroke-[2]" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-white mb-2">No articles found</h3>
          <p className="text-xs sm:text-sm text-[#919A94] max-w-md mx-auto mb-5">
            {search
              ? `No articles match "${search}". Try another keyword or clear your filters.`
              : 'There are currently no published articles in this category.'}
          </p>
          {(search || selectedCategory) && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setSelectedCategory('');
                setPage(1);
              }}
              className="px-5 py-2 rounded-md border border-[#2ABD00]/60 bg-[#2ABD00]/10 text-[#2ABD00] font-mono text-xs uppercase tracking-wider hover:bg-[#2ABD00]/20 transition-all"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div {...reveal} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
          {blogs.map((blog, idx) => {
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
                style={stagger(idx % 3 + 1)}
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
                    {/* Dark gradient overlay */}
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
                  <div className="p-5 flex flex-col gap-2">
                    <h2 className="text-base sm:text-[18px] font-bold text-white leading-snug tracking-tight group-hover:text-[#2ABD00] transition-colors line-clamp-2">
                      <Link href={`/blog/${blog.slug}`}>
                        {blog.title}
                      </Link>
                    </h2>

                    {blog.excerpt && (
                      <p className="text-xs sm:text-[13px] text-[#919A94] font-sans leading-relaxed line-clamp-3">
                        {blog.excerpt}
                      </p>
                    )}
                  </div>
                </div>

                {/* Card Footer: Metadata + Action Link */}
                <div className="px-5 pb-5 pt-3 border-t border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 text-[11px] font-mono text-[#919A94]">
                    <span>{blog.reading_time || 5} min read</span>
                    <span className="w-1 h-1 rounded-full bg-[#2ABD00]" />
                    <span>{formattedDate}</span>
                  </div>

                  <Link
                    href={`/blog/${blog.slug}`}
                    aria-label={`Read full article: ${blog.title}`}
                    className="flex h-[30px] w-[30px] items-center justify-center rounded-md border border-white/20 bg-black/60 text-white/80 group-hover:border-[#2ABD00] group-hover:bg-[#2ABD00]/20 group-hover:text-[#2ABD00] group-hover:shadow-[0_0_12px_rgba(42,189,0,0.4)] transition-all"
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
      )}

      {/* ==============================================================
          PAGINATION CONTROLS
          ============================================================== */}
      {totalPages > 1 && (
        <div {...reveal} className="mt-12 sm:mt-16 flex items-center justify-center gap-2 sm:gap-3">
          {/* Previous Button */}
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => {
              setPage((p) => Math.max(1, p - 1));
              window.scrollTo({ top: 200, behavior: 'smooth' });
            }}
            className="flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-lg border border-white/15 bg-[#061208]/90 text-xs sm:text-sm font-mono text-white/90 disabled:opacity-30 disabled:cursor-not-allowed hover:enabled:border-[#2ABD00] hover:enabled:text-[#2ABD00] hover:enabled:shadow-[0_0_12px_rgba(42,189,0,0.25)] transition-all"
          >
            <svg className="w-4 h-4 fill-none stroke-current stroke-[2]" viewBox="0 0 24 24">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            <span className="hidden xs:inline">Previous</span>
          </button>

          {/* Page Indicator */}
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-white/10 bg-black/40 text-xs font-mono text-[#919A94]">
            <span className="text-white font-bold">{page}</span>
            <span>/</span>
            <span>{totalPages}</span>
          </div>

          {/* Next Button */}
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => {
              setPage((p) => Math.min(totalPages, p + 1));
              window.scrollTo({ top: 200, behavior: 'smooth' });
            }}
            className="flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-lg border border-white/15 bg-[#061208]/90 text-xs sm:text-sm font-mono text-white/90 disabled:opacity-30 disabled:cursor-not-allowed hover:enabled:border-[#2ABD00] hover:enabled:text-[#2ABD00] hover:enabled:shadow-[0_0_12px_rgba(42,189,0,0.25)] transition-all"
          >
            <span className="hidden xs:inline">Next</span>
            <svg className="w-4 h-4 fill-none stroke-current stroke-[2]" viewBox="0 0 24 24">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

export default BlogListContent;
