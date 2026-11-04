import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { routing, type Locale } from '@/i18n/routing';
import { buildMetadata } from '@/lib/seo/metadata';
import { demoMedia, galleryItems, heroMedia } from '@/lib/media/library';
import { LockScreenHero } from '@/components/home/lock-screen-hero';
import { DemoSection } from '@/components/home/demo-section';
import { LockScreenSection } from '@/components/home/lock-screen-section';
import { GalleryMarquee } from '@/components/home/gallery-marquee';
import { StatsSection } from '@/components/home/stats-section';
import { FeaturesSection } from '@/components/home/features-section';
import { WorksWithSection } from '@/components/home/works-with-section';
import { TestimonialsSection } from '@/components/home/testimonials-section';
import { LaptopSection } from '@/components/home/laptop-section';
import { FaqSection, type FaqItem } from '@/components/home/faq-section';
import { CtaSection } from '@/components/home/cta-section';
import { RevealProvider } from '@/components/home/reveal-provider';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'landing.hero' });
  const tMeta = await getTranslations({ locale, namespace: 'meta' });

  return buildMetadata({
    title: tMeta('siteTitle'),
    description: t('description'),
    path: '/',
    locale,
  });
}

export default async function HomePage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const tFaq = await getTranslations('faq.items');

  const faqItems: FaqItem[] = (
    ['trial', 'system', 'battery', 'bends', 'license', 'import'] as const
  ).map((key) => ({
    id: key,
    question: tFaq(`${key}.q`),
    answer: tFaq(`${key}.a`),
  }));

  const folders = galleryItems();
  const demoHref = demoMedia?.src ?? null;

  return (
    <>
      <LockScreenHero heroMedia={heroMedia} folders={folders} demoHref={demoHref} />
      <DemoSection />
      <LockScreenSection />
      <GalleryMarquee />
      <StatsSection />
      <FeaturesSection />
      <WorksWithSection />
      <TestimonialsSection />
      <LaptopSection />
      <FaqSection items={faqItems} />
      <CtaSection demoHref={demoHref} />
      <RevealProvider />
    </>
  );
}
