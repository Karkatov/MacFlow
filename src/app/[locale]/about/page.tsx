import type { Metadata } from 'next';
import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Apple, Cpu, Download, Layers3, MonitorSmartphone, Sparkles } from 'lucide-react';
import { routing, type Locale } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';
import { buildMetadata } from '@/lib/seo/metadata';
import { cdnUrl, siteConfig } from '@/config/site';
import { Button } from '@/components/ui/button';
import { SectionHeading } from '@/components/shared/section-heading';
import { Reveal, StaggerGroup, StaggerItem } from '@/components/shared/motion';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'about' });

  return buildMetadata({
    title: t('title'),
    description: t('subtitle'),
    path: '/about',
    locale,
  });
}

export default async function AboutPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('about');

  const screenshots = [
    { src: cdnUrl('/placeholders/screenshots/app-main.svg'), label: 'Основное окно' },
    { src: cdnUrl('/placeholders/screenshots/app-player.svg'), label: 'Плеер' },
    { src: cdnUrl('/placeholders/screenshots/app-catalog.svg'), label: 'Каталог' },
    { src: cdnUrl('/placeholders/screenshots/app-bend.svg'), label: 'Эффект Bend' },
  ];

  const requirements = [
    { icon: Apple, label: t('macos'), value: `macOS ${siteConfig.APP.minMacOS} (Sequoia) и новее` },
    { icon: Cpu, label: t('chip'), value: t('architecture') },
    { icon: Layers3, label: t('extensions'), value: t('extensionsValue') },
    { icon: MonitorSmartphone, label: t('version'), value: siteConfig.APP.version },
  ];

  const highlights = [
    { icon: Sparkles, text: t('featuresBody') },
    { icon: MonitorSmartphone, text: t('whatBody') },
    { icon: Layers3, text: t('demoBody') },
  ];

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-12 sm:px-6 lg:py-16">
      <SectionHeading
        level={1}
        eyebrow={t('title')}
        title={t('subtitle')}
        description={t('whatBody')}
      />

      {/* Скриншоты */}
      <section className="mt-16">
        <h2 className="text-foreground text-display-sm">{t('screenshotsTitle')}</h2>
        <p className="text-muted-foreground mt-2 text-sm">{t('screenshotsBody')}</p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {screenshots.map((shot, index) => (
            <Reveal
              key={shot.src}
              delay={index * 0.06}
              direction={index % 2 === 0 ? 'left' : 'right'}
            >
              <figure className="group border-border/70 bg-card/50 hover:border-brand/35 overflow-hidden rounded-2xl border transition-[border-color,box-shadow] duration-300 hover:shadow-[0_24px_70px_-36px_var(--brand-glow)]">
                <Image
                  src={shot.src}
                  alt={shot.label}
                  width={1200}
                  height={750}
                  className="w-full transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                  placeholder="blur"
                  blurDataURL={`/placeholders/screenshots/app-main.svg`}
                />
                <figcaption className="text-muted-foreground px-4 py-3 text-sm">
                  {shot.label}
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Ключевые особенности */}
      <section className="mt-16">
        <h2 className="text-foreground text-display-sm">{t('featuresTitle')}</h2>

        <StaggerGroup className="mt-8 grid gap-4 md:grid-cols-3">
          {highlights.map((item, index) => (
            <StaggerItem
              key={item.text}
              className="h-full"
              direction={index % 2 === 0 ? 'scale' : 'up'}
            >
              <div className="group border-border/60 bg-card/40 hover:border-brand/35 flex h-full flex-col rounded-2xl border p-6 backdrop-blur-xl transition-[transform,border-color,box-shadow] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-1 hover:shadow-[0_20px_50px_-30px_var(--brand-glow)]">
                <span className="bg-brand/10 text-brand-foreground ring-brand/20 flex size-11 items-center justify-center rounded-xl ring-1 transition-transform duration-300 group-hover:scale-105">
                  <item.icon className="size-5" aria-hidden="true" />
                </span>
                <p className="text-muted-foreground mt-4 text-sm leading-relaxed">{item.text}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </section>

      {/* Требования */}
      <section className="mt-16">
        <h2 className="text-foreground text-display-sm">{t('requirementsTitle')}</h2>
        <p className="text-muted-foreground mt-2 text-sm">{t('requirementsBody')}</p>

        <Reveal direction="right">
          <dl className="mt-8 grid gap-3 sm:grid-cols-2">
            {requirements.map((item) => (
              <div
                key={item.label}
                className="border-border/60 bg-card/40 flex items-start gap-3 rounded-2xl border px-5 py-4 backdrop-blur-xl"
              >
                <span className="bg-secondary/60 text-foreground flex size-9 shrink-0 items-center justify-center rounded-lg">
                  <item.icon className="size-4" aria-hidden="true" />
                </span>
                <span>
                  <dt className="text-muted-foreground text-xs tracking-[0.12em] uppercase">
                    {item.label}
                  </dt>
                  <dd className="text-foreground mt-0.5 text-sm">{item.value}</dd>
                </span>
              </div>
            ))}
          </dl>
        </Reveal>
      </section>

      {/* CTA */}
      <Reveal direction="scale">
        <div className="border-brand/25 bg-gradient-brand-strong mt-16 flex flex-col items-center gap-4 rounded-3xl border px-6 py-12 text-center shadow-[0_30px_90px_-40px_var(--brand-glow-strong)]">
          <h2 className="text-display-sm text-white">{t('download')}</h2>

          <Button asChild size="lg" className="bg-white text-[#0A0A0C] hover:bg-white/90">
            <Link href="/download">
              <Download className="size-4" />
              {t('download')}
            </Link>
          </Button>
        </div>
      </Reveal>
    </div>
  );
}
