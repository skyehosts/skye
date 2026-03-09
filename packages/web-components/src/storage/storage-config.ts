import { StorageKey } from './storage-keys';

export type StorageItemConfig<T> = {
  key: StorageKey;
  defaultValue: T;
  sessionOnly?: boolean;
};

export type CookiePermissionState = 'unanswered' | 'accepted' | 'declined';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const STORAGE_ITEMS: StorageItemConfig<any>[] = [
  {
    key: StorageKey.COOKIE_PERMISSION_STATE,
    defaultValue: 'unanswered' as CookiePermissionState,
    sessionOnly: false,
  },
];
