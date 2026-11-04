import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { LifeBuoy } from 'lucide-react';
import { routing, type Locale } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';
import { buildMetadata } from '@/lib/seo/metadata';
import { faqJsonLd } from '@/lib/seo/jsonld';
import { Reveal } from '@/components/shared/motion';
import { FaqAccordion } from '@/components/faq/faq-accordion';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

const FAQ_KEYS = [
  'trial',
  'system',
  'battery',
  'bends',
  'music',
  'license',
  'devices',
  'payment',
  'import',
  'catalog',
] as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'faq' });

  return buildMetadata({
    title: t('title'),
    description: t('subtitle'),
    path: '/faq',
    locale,
    keywords: ['вопросы о MacFlow', 'MacFlow FAQ', 'как установить MacFlow'],
  });
}

export default async function FaqPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('faq');
  const tItems = await getTranslations('faq.items');

  const items = FAQ_KEYS.map((key) => ({
    id: key,
    question: tItems(`${key}.q`),
    answer: tItems(`${key}.a`),
  }));

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:py-16">
      <Reveal>
        <header className="text-center">
          <span className="border-brand/25 bg-brand/10 text-brand-foreground inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium tracking-[0.14em] uppercase">
            {t('title')}
          </span>
          <h1 className="text-foreground text-display-md mt-4">{t('subtitle')}</h1>
        </header>
      </Reveal>

      <Reveal direction="scale">
        <div className="border-border/50 bg-card/30 mt-10 rounded-2xl border px-5 py-2 backdrop-blur-xl sm:px-7">
          <FaqAccordion items={items} />
        </div>
      </Reveal>

      <Reveal direction="up">
        <div className="border-border/60 bg-card/30 mt-10 flex flex-col items-center gap-3 rounded-2xl border px-6 py-8 text-center backdrop-blur-xl">
          <span className="bg-brand/12 text-brand-foreground flex size-12 items-center justify-center rounded-2xl">
            <LifeBuoy className="size-6" aria-hidden="true" />
          </span>
          <p className="text-foreground text-base font-semibold">{t('contactCta')}</p>
          <Link
            href="/support"
            className="text-brand-foreground text-sm font-medium underline-offset-4 hover:underline"
          >
            {t('contactLink')}
          </Link>
        </div>
      </Reveal>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: faqJsonLd(items) }} />
    </div>
  );
}
