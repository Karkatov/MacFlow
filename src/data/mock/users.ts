import type { User } from '@/types';
import { cdnUrl } from '@/config/site';

/** Моковые пользователи для личного кабинета и админки. */
export const mockUsers: User[] = [
  {
    id: 'u-1',
    email: 'demo@macflow.app',
    name: 'Демо Пользователь',
    avatar: cdnUrl('/placeholders/avatars/avatar-01.svg'),
    createdAt: '2026-06-01T09:00:00.000Z',
    subscriptionStatus: 'subscribed',
    plan: 'lifetime',
    expiresAt: null,
  },
  {
    id: 'u-2',
    email: 'trial@macflow.app',
    name: 'Пробный пользователь',
    avatar: cdnUrl('/placeholders/avatars/avatar-03.svg'),
    createdAt: '2026-10-15T09:00:00.000Z',
    subscriptionStatus: 'trial',
    plan: 'none',
    expiresAt: '2026-10-16T09:00:00.000Z',
  },
  {
    id: 'u-3',
    email: 'expired@macflow.app',
    name: 'Истёкший триал',
    avatar: cdnUrl('/placeholders/avatars/avatar-05.svg'),
    createdAt: '2026-05-12T09:00:00.000Z',
    subscriptionStatus: 'expired',
    plan: 'none',
    expiresAt: null,
  },
];

/** Пользователь по email (мок-вход без пароля). */
export function findUserByEmail(email: string): User | undefined {
  const normalized = email.trim().toLowerCase();
  return mockUsers.find((user) => user.email === normalized);
}
