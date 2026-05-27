'use client';

import { auth as authApi } from './api';
import type { User } from '@/types';

let cachedUser: User | null = null;

export async function getUser(): Promise<User | null> {
  if (cachedUser) return cachedUser;
  try {
    const user = await authApi.me() as User;
    cachedUser = user;
    return user;
  } catch {
    return null;
  }
}

export function clearUser() {
  cachedUser = null;
}

export function setCachedUser(user: User) {
  cachedUser = user;
}

export async function logout() {
  try { await authApi.logout(); } catch {}
  clearUser();
  window.location.href = '/login';
}
