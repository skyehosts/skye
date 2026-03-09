import AsyncStorage from "@react-native-async-storage/async-storage";

export const StorageKeys = {
  ONBOARDING_SEEN: "onboarding_seen",
  LISTING_DRAFTS: "listing_drafts",
  APP_INSTALLED: "app_installed",
} as const;

export type StorageKey = (typeof StorageKeys)[keyof typeof StorageKeys];

const StorageService = {
  async setItem<T>(key: StorageKey, value: T): Promise<void> {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  },

  async getItem<T>(key: StorageKey): Promise<T | null> {
    const json = await AsyncStorage.getItem(key);
    return json !== null ? (JSON.parse(json) as T) : null;
  },

  async removeItem(key: StorageKey): Promise<void> {
    await AsyncStorage.removeItem(key);
  },

  async clearAll(): Promise<void> {
    await Promise.all(
      Object.values(StorageKeys).map((k) => AsyncStorage.removeItem(k)),
    );
  },
};

export default StorageService;
