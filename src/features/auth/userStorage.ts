import { queryClient } from '@/lib/queryClient';

let userId: string | null = null;

export function setStorageUserId(id: string | null) {
  if (userId !== id) queryClient.clear();
  userId = id;
}

export function getUserStorageKey(key: string) {
  return `${key}:${getStorageUserId()}`;
}

export function getStorageUserId() {
  if (!userId) throw new Error('로그인이 필요해요.');
  return userId;
}
