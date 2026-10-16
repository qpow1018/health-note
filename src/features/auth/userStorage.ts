let userId: string | null = null;

export function setStorageUserId(id: string | null) {
  userId = id;
}

export function getUserStorageKey(key: string) {
  if (!userId) throw new Error('로그인이 필요해요.');
  return `${key}:${userId}`;
}
