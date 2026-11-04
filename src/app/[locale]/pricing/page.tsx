import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Check, Flame, Sparkles } from 'lucide-react';
import { routing, type Locale } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';
import { buildMetadata } from '@/lib/seo/metadata';
import { pricing } from '@/config/site';
import { formatPrice } from '@/lib/utils/format';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MaskReveal, Reveal, StaggerGroup, StaggerItem } from '@/components/shared/motion';
import { BuyButton } from '@/components/wallpaper/buy-button';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pricing' });

  return buildMetadata({
    title: t('title'),
    description: t('subtitle'),
    path: '/pricing',
    locale,
    keywords: ['MacFlow цена', 'премиум MacFlow', 'macflow price'],
  });
}

export default async function PricingPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('pricing');
  const tCommon = await getTranslations('common');

  const featureKeys = [
    'catalog',
    'lockscreen',
    'favorites',
    'updates',
    'support',
    'import',
  ] as const;

  const plans = [
    {
      id: 'trial',
      name: t('trial'),
      badge: t('trialBadge'),
      price: t('trialPrice'),
      period: '',
      description: t('trialDescription'),
      cta: tCommon('install'),
      featured: false,
      action: { type: 'link' as const, href: '/download' as const },
    },
    {
      id: 'lifetime',
      name: t('lifetime'),
      badge: t('mostPopular'),
      price: formatPrice(pricing.lifetime),
      period: t('oneTime'),
      description: t('lifetimeDescription'),
      cta: tCommon('buy'),
      featured: true,
      action: { type: 'buy' as const, kind: 'subscription' as const, itemId: 'lifetime' },
    },
    {
      id: 'yearly',
      name: t('yearly'),
      badge: null,
      price: formatPrice(pricing.yearly),
      period: t('perYear'),
      description: t('yearlyDescription'),
      cta: tCommon('buy'),
      featured: false,
      action: { type: 'buy' as const, kind: 'subscription' as const, itemId: 'yearly' },
    },
  ];

  return (
    <div className="mx-auto max-w-[1200px] px-4 pt-6 pb-12 sm:px-6 lg:pt-8 lg:pb-16">
      <Reveal className="flex flex-col items-center text-center">
        <h1 className="text-foreground">
          <span className="border-brand/30 bg-brand/10 text-display-md inline-flex rounded-full border px-8 py-3 font-semibold tracking-tight shadow-[0_20px_60px_-30px_var(--brand-glow-strong)] sm:px-10">
            <MaskReveal>{t('title')}</MaskReveal>
          </span>
        </h1>

        <p className="text-muted-foreground text-lead mt-6 max-w-2xl">{t('subtitle')}</p>
      </Reveal>

      {/* Тарифы */}
      <StaggerGroup className="mt-12 grid gap-5 lg:grid-cols-3">
        {plans.map((plan) => (
          <StaggerItem
            key={plan.id}
            className="h-full"
            direction={plan.featured ? 'scale' : plan.id === 'trial' ? 'left' : 'right'}
          >
            <div className="relative h-full">
              {plan.featured && (
                <span
                  aria-hidden="true"
                  className="bg-brand/25 animate-pulse-glow pointer-events-none absolute -inset-2 rounded-[32px] blur-2xl"
                />
              )}

              <div
                className={
                  plan.featured
                    ? 'border-brand/40 from-brand/12 to-card/60 hover:border-brand/60 relative flex h-full flex-col rounded-3xl border bg-gradient-to-b p-7 shadow-[0_30px_90px_-40px_var(--brand-glow-strong)] backdrop-blur-xl transition-[transform,border-color,box-shadow] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-1 hover:shadow-[0_36px_100px_-36px_var(--brand-glow-strong)]'
                    : 'border-border/70 bg-card/50 hover:border-brand/45 relative flex h-full flex-col rounded-3xl border p-7 backdrop-blur-xl transition-[transform,border-color,box-shadow] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-1 hover:shadow-[0_24px_70px_-32px_var(--brand-glow)]'
                }
              >
                {plan.badge && (
                  <span className="absolute top-5 right-5">
                    <Badge variant="brand">
                      {plan.featured && <Flame className="size-3" aria-hidden="true" />}
                      {plan.badge}
                    </Badge>
                  </span>
                )}

                <h2 className="text-foreground pr-24 text-lg font-semibold tracking-tight">
                  {plan.name}
                </h2>

                <p className="mt-4 flex items-baseline gap-2">
                  <span className="text-foreground text-4xl font-bold tracking-tight">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-muted-foreground text-sm">{plan.period}</span>
                  )}
                </p>

                <p className="text-muted-foreground mt-3 flex-1 text-sm leading-relaxed">
                  {plan.description}
                </p>

                <div className="mt-6">
                  {plan.action.type === 'buy' ? (
                    <BuyButton
                      kind={plan.action.kind}
                      itemId={plan.action.itemId}
                      title={plan.name}
                      price={plan.id === 'lifetime' ? pricing.lifetime : pricing.yearly}
                      priceLabel={plan.cta}
                      variant={plan.featured ? 'gradient' : 'outline'}
                      size="lg"
                      className="w-full"
                    />
                  ) : (
                    <Button asChild variant="outline" size="lg" className="w-full">
                      <Link href="/download">{plan.cta}</Link>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </StaggerItem>
        ))}
      </StaggerGroup>

      {/* Скидка на триал */}
      <Reveal direction="left">
        <div className="border-brand/25 bg-brand/8 mt-6 flex flex-col items-start gap-3 rounded-2xl border p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <Sparkles className="text-brand-foreground mt-0.5 size-5 shrink-0" aria-hidden="true" />
            <div>
              <p className="text-foreground text-sm font-semibold">{t('trialDiscountTitle')}</p>
              <p className="text-muted-foreground mt-1 text-sm">{t('trialDiscountBody')}</p>
            </div>
          </div>

          <BuyButton
            kind="subscription"
            itemId="lifetime-trial"
            title={t('lifetime')}
            price={pricing.trialDiscount}
            priceLabel={formatPrice(pricing.trialDiscount)}
            variant="outline"
          />
        </div>
      </Reveal>

      {/* Что входит в Premium */}
      <section className="mt-16">
        <h2 className="text-foreground text-display-sm">{t('featuresTitle')}</h2>

        <Reveal direction="right">
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {featureKeys.map((key) => (
              <li key={key} className="flex items-start gap-3">
                <span className="bg-brand/15 text-brand-foreground mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full">
                  <Check className="size-3.5" aria-hidden="true" />
                </span>
                <span className="text-muted-foreground text-sm">{t(`features.${key}`)}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      </section>

      {/* Сравнение */}
      <section className="mt-16">
        <h2 className="text-foreground text-display-sm">{t('compareTitle')}</h2>

        <Reveal direction="scale">
          <div className="border-border/70 mt-6 overflow-x-auto rounded-2xl border">
            <table className="w-full min-w-[560px] border-collapse text-sm">
              <thead>
                <tr className="bg-card/60 text-left">
                  <th scope="col" className="text-muted-foreground px-4 py-3 font-medium">
                    {tCommon('all')}
                  </th>
                  <th scope="col" className="text-foreground px-4 py-3 font-medium">
                    {t('trial')}
                  </th>
                  <th scope="col" className="text-foreground px-4 py-3 font-medium">
                    {t('lifetime')}
                  </th>
                  <th scope="col" className="text-foreground px-4 py-3 font-medium">
                    {t('yearly')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {featureKeys.map((key) => (
                  <tr key={key} className="border-border/60 border-t">
                    <th
                      scope="row"
                      className="text-muted-foreground px-4 py-3 text-left font-normal"
                    >
                      {t(`features.${key}`)}
                    </th>
                    <td className="px-4 py-3">
                      <Check className="text-brand-foreground size-4" aria-hidden="true" />
                    </td>
                    <td className="px-4 py-3">
                      <Check className="text-brand-foreground size-4" aria-hidden="true" />
                    </td>
                    <td className="px-4 py-3">
                      <Check className="text-brand-foreground size-4" aria-hidden="true" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
