import React from 'react';
import { fetchFaqs } from '@/lib/blog-api';
import { HomeFaqSection } from './HomeFaqSection';

export async function HomeFaqWrapper() {
  const faqData = await fetchFaqs();
  if (!faqData || !faqData.data || faqData.data.length === 0) {
    return null;
  }
  return <HomeFaqSection initialData={faqData} />;
}

export default HomeFaqWrapper;
