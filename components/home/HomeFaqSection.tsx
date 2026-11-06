'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { reveal, stagger } from '@/lib/reveal';
import { FaqItem, FaqsResponse } from '@/lib/blog-api';
import { JsonLd } from '@/components/seo/JsonLd';

interface HomeFaqSectionProps {
  initialData: FaqsResponse | null;
}

export function HomeFaqSection({ initialData }: HomeFaqSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [expandedId, setExpandedId] = useState<number | null>(
    initialData?.data?.[0]?.id ?? null
  );

  if (!initialData || !initialData.data || initialData.data.length === 0) {
    return null;
  }

  const { data: faqs, categories = [], schema } = initialData;

  const filteredFaqs =
    selectedCategory === 'All'
      ? faqs
      : faqs.filter((faq: FaqItem) => faq.category === selectedCategory);

  const toggleFaq = (id: number) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <section
      id="qx-faq"
      aria-labelledby="qx-faq-heading"
      className="mx-auto max-w-[var(--qx-shell)] w-full px-3 sm:px-6 lg:px-8 pt-12 sm:pt-16 md:pt-20 pb-16 sm:pb-20 lg:pb-24 relative select-none overflow-hidden"
    >
      {/* Inject Google FAQPage Schema Markup from Backend */}
      {schema && <JsonLd data={schema} />}

      {/* Ambient Green Background Glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] sm:w-[900px] h-[500px] sm:h-[700px] bg-[#2ABD00]/6 rounded-full blur-[160px]" />

      <div {...reveal} className="relative w-full">
        {/* =========================================================================
            SECTION HEADER
            ========================================================================= */}
        <div className="text-center max-w-[54rem] mx-auto mb-8 sm:mb-12 relative z-20 px-4">
          <div data-rv style={stagger(0)} className="mb-2">
            <span className="font-mono text-xs uppercase tracking-[0.28em] text-[#919A94] font-medium">
              FREQUENTLY ASKED QUESTIONS
            </span>
          </div>

          <h2
            id="qx-faq-heading"
            className="qx-display text-[clamp(1.85rem,5.5vw,2.75rem)] font-bold text-white tracking-tight leading-[1.18]"
          >
            Got Questions?{' '}
            <span className="text-[#2ABD00] drop-shadow-[0_0_24px_rgba(42,189,0,0.7)]">
              We Have Answers
            </span>
            <span className="text-[#2ABD00] drop-shadow-[0_0_10px_#2ABD00]">.</span>
          </h2>
          <div className="w-12 sm:w-16 h-[2px] bg-[#2ABD00] rounded-full mx-auto mt-3.5" />
          <p className="mt-5 md:mt-7 text-[11px] sm:text-xs font-mono uppercase tracking-[0.2em] sm:tracking-[0.22em] text-[#919A94]">
            CLEAR TRANSPARENCY · NO COMPLICATED JARGON
          </p>
        </div>

        {/* =========================================================================
            CATEGORY FILTER PILLS
            ========================================================================= */}
        {categories.length > 1 && (
          <div data-rv style={stagger(1)} className="flex items-center justify-center gap-2 flex-wrap mb-8 sm:mb-10 relative z-20">
            <button
              type="button"
              onClick={() => setSelectedCategory('All')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all duration-300 ${
                selectedCategory === 'All'
                  ? 'border border-[#2ABD00] bg-[#2ABD00]/20 text-[#2ABD00] shadow-[0_0_12px_rgba(42,189,0,0.3)] font-bold'
                  : 'border border-white/10 bg-[#061208]/60 text-[#919A94] hover:text-white hover:border-white/25'
              }`}
            >
              All ({faqs.length})
            </button>

            {categories.map((c: { category: string; count: number }) => {
              const isSelected = selectedCategory === c.category;
              return (
                <button
                  key={c.category}
                  type="button"
                  onClick={() => setSelectedCategory(c.category)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all duration-300 ${
                    isSelected
                      ? 'border border-[#2ABD00] bg-[#2ABD00]/20 text-[#2ABD00] shadow-[0_0_12px_rgba(42,189,0,0.3)] font-bold'
                      : 'border border-white/10 bg-[#061208]/60 text-[#919A94] hover:text-white hover:border-white/25'
                  }`}
                >
                  {c.category} ({c.count})
                </button>
              );
            })}
          </div>
        )}

        {/* =========================================================================
            ACCORDION LIST
            ========================================================================= */}
        <div className="max-w-[840px] mx-auto flex flex-col gap-3 relative z-10">
          {filteredFaqs.map((faq: FaqItem, idx: number) => {
            const isExpanded = expandedId === faq.id;

            return (
              <div
                key={faq.id}
                data-rv
                style={stagger(idx + 1)}
                className={`overflow-hidden rounded-xl border transition-all duration-400 ease-out backdrop-blur-xl ${
                  isExpanded
                    ? 'border-[#2ABD00] bg-gradient-to-b from-[#09220f]/95 via-[#041407]/98 to-[#010602] shadow-[0_12px_36px_rgba(0,0,0,0.9),0_0_24px_rgba(42,189,0,0.22)]'
                    : 'border-white/15 bg-gradient-to-b from-[#06180a]/80 via-[#031006]/85 to-[#010602]/90 hover:border-[#2ABD00]/50 hover:bg-[#071c0c]/85'
                }`}
              >
                {/* Accordion Trigger */}
                <button
                  type="button"
                  onClick={() => toggleFaq(faq.id)}
                  aria-expanded={isExpanded}
                  className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <span
                      className={`font-mono text-xs transition-colors shrink-0 ${
                        isExpanded ? 'text-[#2ABD00] font-bold' : 'text-[#919A94]'
                      }`}
                    >
                      {String(idx + 1).padStart(2, '0')}.
                    </span>
                    <h3
                      className={`text-sm sm:text-base font-bold transition-colors leading-snug tracking-tight ${
                        isExpanded ? 'text-[#2ABD00]' : 'text-white'
                      }`}
                    >
                      {faq.question}
                    </h3>
                  </div>

                  {/* Expand Indicator Icon */}
                  <div
                    className={`flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
                      isExpanded
                        ? 'border-[#2ABD00] bg-[#2ABD00]/20 text-[#2ABD00] shadow-[0_0_8px_rgba(42,189,0,0.4)] rotate-45'
                        : 'border-white/20 bg-black/60 text-white/80 group-hover:border-[#2ABD00] group-hover:text-[#2ABD00]'
                    }`}
                  >
                    <svg className="w-3.5 h-3.5 stroke-current fill-none stroke-[2.2]" viewBox="0 0 24 24">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  </div>
                </button>

                {/* Accordion Body */}
                <div
                  className={`transition-all duration-400 ease-in-out overflow-hidden px-4 sm:px-5 ${
                    isExpanded ? 'max-h-96 pb-5 opacity-100' : 'max-h-0 pb-0 opacity-0'
                  }`}
                >
                  <div className="pt-2 border-t border-white/10 text-xs sm:text-sm text-[#c4dbc8] leading-relaxed font-sans">
                    {faq.answer}
                  </div>
                  {faq.category && (
                    <div className="mt-3">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider text-[#2ABD00] bg-[#2ABD00]/10 border border-[#2ABD00]/30">
                        {faq.category}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA to /faq */}
        <div data-rv style={stagger(5)} className="mt-10 sm:mt-12 text-center relative z-20">
          <Link
            href="/faq"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-[4px] border border-[#2ABD00]/60 bg-[#06180a]/80 text-[#2ABD00] font-mono text-xs uppercase tracking-[0.25em] font-semibold hover:border-[#2ABD00] hover:bg-[#2ABD00]/15 hover:shadow-[0_0_16px_rgba(42,189,0,0.35)] transition-all duration-300"
          >
            <span>View All Questions</span>
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

export default HomeFaqSection;
