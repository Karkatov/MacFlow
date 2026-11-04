import type { Purchase } from '@/types';

/** Моковые покупки для личного кабинета. */
export const mockPurchases: Purchase[] = [
  {
    id: 'pay-1',
    userId: 'u-1',
    email: 'demo@macflow.app',
    itemType: 'subscription',
    itemId: 'premium-lifetime',
    itemTitle: 'Premium — навсегда',
    amount: 890,
    currency: 'RUB',
    status: 'paid',
    invoiceId: 'DEMO-0001',
    createdAt: '2026-07-20T11:24:00.000Z',
    downloadUrl: null,
  },
];

/** Покупки конкретного пользователя. */
export function purchasesForUser(userId: string): Purchase[] {
  return mockPurchases.filter((purchase) => purchase.userId === userId);
}
