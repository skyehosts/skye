import { Platform } from "react-native";

const TOKEN_KEY = "auth_token";
const REFRESH_TOKEN_KEY = "auth_refresh_token";
const PIN_HASH_KEY = "pin_hash";
const PIN_SALT_KEY = "pin_salt";
const BIOMETRICS_ENABLED_KEY = "biometrics_enabled";
const PIN_ATTEMPT_COUNT_KEY = "pin_attempt_count";
const PIN_USER_ID_KEY = "pin_user_id";
const USER_KEY = "auth_user";

async function getSecureStore() {
  if (Platform.OS === "web") {
    return {
      getItemAsync: async (key: string) => localStorage.getItem(key),
      setItemAsync: async (key: string, value: string) =>
        localStorage.setItem(key, value),
      deleteItemAsync: async (key: string) => localStorage.removeItem(key),
    };
  }
  return await import("expo-secure-store");
}

// Access token
export async function getToken(): Promise<string | null> {
  const store = await getSecureStore();
  return store.getItemAsync(TOKEN_KEY);
}

export async function setToken(token: string): Promise<void> {
  const store = await getSecureStore();
  await store.setItemAsync(TOKEN_KEY, token);
}

export async function deleteToken(): Promise<void> {
  const store = await getSecureStore();
  await store.deleteItemAsync(TOKEN_KEY);
}

// Refresh token
export async function getRefreshToken(): Promise<string | null> {
  const store = await getSecureStore();
  return store.getItemAsync(REFRESH_TOKEN_KEY);
}

export async function setRefreshToken(token: string): Promise<void> {
  const store = await getSecureStore();
  await store.setItemAsync(REFRESH_TOKEN_KEY, token);
}

export async function deleteRefreshToken(): Promise<void> {
  const store = await getSecureStore();
  await store.deleteItemAsync(REFRESH_TOKEN_KEY);
}

// PIN hash
export async function getPinHash(): Promise<string | null> {
  const store = await getSecureStore();
  return store.getItemAsync(PIN_HASH_KEY);
}

export async function setPinHash(hash: string): Promise<void> {
  const store = await getSecureStore();
  await store.setItemAsync(PIN_HASH_KEY, hash);
}

export async function deletePinHash(): Promise<void> {
  const store = await getSecureStore();
  await store.deleteItemAsync(PIN_HASH_KEY);
}

// PIN salt
export async function getPinSalt(): Promise<string | null> {
  const store = await getSecureStore();
  return store.getItemAsync(PIN_SALT_KEY);
}

export async function setPinSalt(salt: string): Promise<void> {
  const store = await getSecureStore();
  await store.setItemAsync(PIN_SALT_KEY, salt);
}

export async function deletePinSalt(): Promise<void> {
  const store = await getSecureStore();
  await store.deleteItemAsync(PIN_SALT_KEY);
}

// Biometrics enabled
export async function getBiometricsEnabled(): Promise<boolean> {
  const store = await getSecureStore();
  const value = await store.getItemAsync(BIOMETRICS_ENABLED_KEY);
  return value === "true";
}

export async function setBiometricsEnabled(enabled: boolean): Promise<void> {
  const store = await getSecureStore();
  await store.setItemAsync(BIOMETRICS_ENABLED_KEY, String(enabled));
}

// PIN user ID (associates PIN with a specific account)
export async function getPinUserId(): Promise<string | null> {
  const store = await getSecureStore();
  return store.getItemAsync(PIN_USER_ID_KEY);
}

export async function setPinUserId(userId: string): Promise<void> {
  const store = await getSecureStore();
  await store.setItemAsync(PIN_USER_ID_KEY, userId);
}

export async function deletePinUserId(): Promise<void> {
  const store = await getSecureStore();
  await store.deleteItemAsync(PIN_USER_ID_KEY);
}

// PIN attempt count
export async function getPinAttemptCount(): Promise<number> {
  const store = await getSecureStore();
  const value = await store.getItemAsync(PIN_ATTEMPT_COUNT_KEY);
  return value ? parseInt(value, 10) : 0;
}

export async function setPinAttemptCount(count: number): Promise<void> {
  const store = await getSecureStore();
  await store.setItemAsync(PIN_ATTEMPT_COUNT_KEY, String(count));
}

export async function resetPinAttemptCount(): Promise<void> {
  const store = await getSecureStore();
  await store.deleteItemAsync(PIN_ATTEMPT_COUNT_KEY);
}

// User
export async function getStoredUser(): Promise<string | null> {
  const store = await getSecureStore();
  return store.getItemAsync(USER_KEY);
}

export async function setStoredUser(userJson: string): Promise<void> {
  const store = await getSecureStore();
  await store.setItemAsync(USER_KEY, userJson);
}

export async function deleteStoredUser(): Promise<void> {
  const store = await getSecureStore();
  await store.deleteItemAsync(USER_KEY);
}

// Clear session data only (preserves PIN + biometrics for returning users)
export async function clearSessionData(): Promise<void> {
  const store = await getSecureStore();
  await Promise.all([
    store.deleteItemAsync(TOKEN_KEY),
    store.deleteItemAsync(REFRESH_TOKEN_KEY),
    store.deleteItemAsync(PIN_ATTEMPT_COUNT_KEY),
    store.deleteItemAsync(USER_KEY),
  ]);
}

// Clear all secure data (used on fresh install)
export async function clearAllSecureData(): Promise<void> {
  const store = await getSecureStore();
  await Promise.all([
    store.deleteItemAsync(TOKEN_KEY),
    store.deleteItemAsync(REFRESH_TOKEN_KEY),
    store.deleteItemAsync(PIN_HASH_KEY),
    store.deleteItemAsync(PIN_SALT_KEY),
    store.deleteItemAsync(PIN_USER_ID_KEY),
    store.deleteItemAsync(BIOMETRICS_ENABLED_KEY),
    store.deleteItemAsync(PIN_ATTEMPT_COUNT_KEY),
    store.deleteItemAsync(USER_KEY),
  ]);
}
