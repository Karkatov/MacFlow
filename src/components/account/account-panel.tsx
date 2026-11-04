'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Download, LogIn, LogOut, Receipt } from 'lucide-react';
import type { Purchase, User } from '@/types';
import { signIn } from '@/lib/api/auth';
import { purchasesForUser } from '@/data/mock/purchases';
import { formatDateShort, formatPrice } from '@/lib/utils/format';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EmptyState } from '@/components/shared/empty-state';
import { Reveal } from '@/components/shared/motion';

/**
 * Личный кабинет.
 *
 * Вход — по email без пароля (демо-режим): после запроса показывается
 * профиль, история покупок и список доступных загрузок.
 *
 * TODO(бэкенд): magic-link на почту или OAuth, синхронизация избранного
 * и корзины с аккаунтом, управление лицензиями и повторная выдача ключей.
 */
export function AccountPanel() {
  const t = useTranslations('account');
  const tCommon = useTranslations('common');
  const tToast = useTranslations('toast');

  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState('demo@macflow.app');
  const [loading, setLoading] = useState(false);

  const purchases: Purchase[] = user ? purchasesForUser(user.id) : [];

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    const result = await signIn(email);
    setLoading(false);

    if (!result.user) {
      toast.error(t('title'), { description: t('demoHint') });
      return;
    }

    setUser(result.user);
    toast.success(t('signedInAs', { email: result.user.email }));
  };

  if (!user) {
    return (
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <Reveal direction="left">
          <div className="border-border/70 bg-card/50 rounded-3xl border p-6 backdrop-blur-xl sm:p-8">
            <h2 className="text-foreground text-lg font-semibold tracking-tight">
              {t('loginTitle')}
            </h2>
            <p className="text-muted-foreground mt-2 text-sm">{t('loginSubtitle')}</p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="account-email">{t('email')}</Label>
                <Input
                  id="account-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder={t('emailPlaceholder')}
                  required
                />
              </div>

              <Button type="submit" variant="gradient" disabled={loading} className="w-full">
                <LogIn className="size-4" aria-hidden="true" />
                {t('signIn')}
              </Button>
            </form>

            <p className="border-border/60 bg-background/40 text-muted-foreground mt-4 rounded-xl border px-4 py-3 text-xs leading-relaxed">
              {t('demoHint')}
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.1} direction="right">
          <div className="border-brand/25 bg-brand/6 h-full rounded-3xl border p-6 backdrop-blur-xl sm:p-8">
            <h2 className="text-foreground text-base font-semibold">{t('mockNotice')}</h2>
            <p className="text-muted-foreground mt-3 text-sm leading-relaxed">{t('mockNotice')}</p>
          </div>
        </Reveal>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Профиль */}
      <Reveal direction="scale">
        <div className="border-border/70 bg-card/50 flex flex-col gap-4 rounded-3xl border p-6 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <p className="text-muted-foreground text-sm">
              {t('signedInAs', { email: user.email })}
            </p>
            <p className="text-foreground mt-1 text-2xl font-bold tracking-tight">{user.name}</p>

            <div className="mt-3 flex flex-wrap gap-2">
              <Badge variant="brand">{user.plan}</Badge>
              <Badge variant="outline">{user.subscriptionStatus}</Badge>
            </div>
          </div>

          <Button variant="outline" onClick={() => setUser(null)}>
            <LogOut className="size-4" aria-hidden="true" />
            {t('signOut')}
          </Button>
        </div>
      </Reveal>

      {/* Покупки */}
      <Reveal direction="right">
        <section>
          <h2 className="text-foreground text-xl font-semibold tracking-tight">{t('purchases')}</h2>
          <p className="text-muted-foreground mt-1 text-sm">{t('purchasesSubtitle')}</p>

          {purchases.length > 0 ? (
            <div className="border-border/70 mt-5 overflow-x-auto rounded-2xl border">
              <table className="w-full min-w-[620px] border-collapse text-sm">
                <thead>
                  <tr className="bg-card/60 text-left">
                    <th scope="col" className="text-muted-foreground px-4 py-3 font-medium">
                      {tCommon('all')}
                    </th>
                    <th scope="col" className="text-muted-foreground px-4 py-3 font-medium">
                      {t('amount')}
                    </th>
                    <th scope="col" className="text-muted-foreground px-4 py-3 font-medium">
                      {t('date')}
                    </th>
                    <th scope="col" className="text-muted-foreground px-4 py-3 font-medium">
                      {t('status')}
                    </th>
                    <th scope="col" className="text-muted-foreground px-4 py-3 font-medium">
                      {t('invoice')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {purchases.map((purchase) => (
                    <tr key={purchase.id} className="border-border/60 border-t">
                      <td className="text-foreground px-4 py-3 font-medium">
                        {purchase.itemTitle}
                      </td>
                      <td className="text-muted-foreground px-4 py-3">
                        {formatPrice(purchase.amount)}
                      </td>
                      <td className="text-muted-foreground px-4 py-3">
                        {formatDateShort(purchase.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={purchase.status} />
                      </td>
                      <td className="text-muted-foreground px-4 py-3 font-mono text-xs">
                        {purchase.invoiceId}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              icon={Receipt}
              title={t('emptyPurchases')}
              description={t('emptyPurchasesHint')}
              className="mt-5"
            />
          )}
        </section>
      </Reveal>

      {/* Загрузки */}
      <Reveal direction="left">
        <section>
          <h2 className="text-foreground text-xl font-semibold tracking-tight">{t('downloads')}</h2>
          <p className="text-muted-foreground mt-1 text-sm">{t('downloadsSubtitle')}</p>

          {purchases.length > 0 ? (
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {purchases.map((purchase) => (
                <li
                  key={purchase.id}
                  className="border-border/60 bg-card/40 flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 backdrop-blur-xl"
                >
                  <span className="min-w-0">
                    <span className="text-foreground block truncate text-sm font-medium">
                      {purchase.itemTitle}
                    </span>
                    <span className="text-muted-foreground block truncate text-xs">
                      {formatPrice(purchase.amount)}
                    </span>
                  </span>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toast(tToast('downloadSoon'))}
                    aria-label={t('download')}
                  >
                    <Download className="size-4" aria-hidden="true" />
                    {t('download')}
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={Download}
              title={t('emptyDownloads')}
              description={t('emptyDownloadsHint')}
              className="mt-5"
            />
          )}
        </section>
      </Reveal>
    </div>
  );
}

function StatusBadge({ status }: { status: Purchase['status'] }) {
  const t = useTranslations('account');

  if (status === 'paid') return <Badge variant="success">{t('statusPaid')}</Badge>;
  if (status === 'refunded') return <Badge variant="danger">{t('statusRefunded')}</Badge>;
  return <Badge variant="warning">{t('statusPending')}</Badge>;
}
