import type { IPhoneVerifyOtpResponseDto } from "../../../../packages/skye-hosts-api-client/src";
import { router } from "expo-router";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { AppState, type AppStateStatus } from "react-native";
import {
  getToken,
  getUser,
  signOut as authSignOut,
} from "../services/auth.service";
import {
  clearPin,
  hasPinForUser,
  hasPinSetup,
  restorePinFromServer,
} from "../services/pin.service";
import { fetchApi } from "../services/api";
import { hasSession } from "../services/session.service";
import StorageService, { StorageKeys } from "../services/storage";
import { clearAllSecureData } from "../services/token.service";

type User = IPhoneVerifyOtpResponseDto["user"];

const LOCK_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

interface AuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  isUnlocked: boolean;
  needsSecuritySetup: boolean;
  user: User | null;
  setUser: (
    user: User,
    pinData?: { hash: string; salt: string },
  ) => Promise<void>;
  unlock: () => void;
  completeSecuritySetup: () => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  isAuthenticated: false,
  isLoading: true,
  isUnlocked: false,
  needsSecuritySetup: false,
  user: null,
  setUser: async () => {},
  unlock: () => {},
  completeSecuritySetup: () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [needsSecuritySetup, setNeedsSecuritySetup] = useState(false);
  const backgroundTimestamp = useRef<number | null>(null);

  useEffect(() => {
    (async () => {
      // Check for fresh install (iOS keychain persists across reinstalls)
      const appInstalled = await StorageService.getItem<boolean>(
        StorageKeys.APP_INSTALLED,
      );
      if (!appInstalled) {
        await clearAllSecureData();
        await StorageService.setItem(StorageKeys.APP_INSTALLED, true);
      }

      const sessionExists = await hasSession();
      if (sessionExists) {
        const token = await getToken();
        let storedUser = null;
        if (token) {
          storedUser = await getUser();
        }

        if (storedUser) {
          try {
            await fetchApi("/account/details", undefined, { method: "GET" });
          } catch {
            await authSignOut();
            await StorageService.clearAll();
            await StorageService.setItem(StorageKeys.APP_INSTALLED, true);
            await StorageService.setItem(StorageKeys.ONBOARDING_SEEN, true);
            setIsLoading(false);
            return;
          }
          setUser(storedUser);

          const pinBelongsToUser = await hasPinForUser(storedUser.id);
          if (!pinBelongsToUser) {
            const pinExists = await hasPinSetup();
            if (pinExists) await clearPin();
            setNeedsSecuritySetup(true);
          } else {
            setNeedsSecuritySetup(false);
          }
        } else {
          const pinExists = await hasPinSetup();
          setNeedsSecuritySetup(!pinExists);
        }
      }

      setIsLoading(false);
    })();
  }, []);

  // Re-lock after background timeout
  useEffect(() => {
    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (nextState === "background" || nextState === "inactive") {
        backgroundTimestamp.current = Date.now();
      } else if (nextState === "active" && backgroundTimestamp.current) {
        const elapsed = Date.now() - backgroundTimestamp.current;
        backgroundTimestamp.current = null;
        if (elapsed >= LOCK_TIMEOUT_MS && user) {
          setIsUnlocked(false);
        }
      }
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange,
    );
    return () => subscription.remove();
  }, [user]);

  const handleSetUser = useCallback(
    async (newUser: User, pinData?: { hash: string; salt: string }) => {
      setUser(newUser);

      // If server returned PIN data, restore it locally
      if (pinData) {
        await restorePinFromServer(pinData, newUser.id);
        setNeedsSecuritySetup(false);
        return;
      }

      // Otherwise check if local PIN belongs to this user
      const pinBelongsToUser = await hasPinForUser(newUser.id);
      if (!pinBelongsToUser) {
        const pinExists = await hasPinSetup();
        if (pinExists) await clearPin();
        setNeedsSecuritySetup(true);
      } else {
        setNeedsSecuritySetup(false);
      }
    },
    [],
  );

  const unlock = useCallback(() => {
    setIsUnlocked(true);
  }, []);

  const completeSecuritySetup = useCallback(() => {
    setNeedsSecuritySetup(false);
  }, []);

  const handleSignOut = useCallback(async () => {
    await authSignOut();
    await StorageService.clearAll();
    await StorageService.setItem(StorageKeys.APP_INSTALLED, true);
    await StorageService.setItem(StorageKeys.ONBOARDING_SEEN, true);
    setUser(null);
    setIsUnlocked(false);
    setNeedsSecuritySetup(false);
    router.replace("/");
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!user,
        isLoading,
        isUnlocked,
        needsSecuritySetup,
        user,
        setUser: handleSetUser,
        unlock,
        completeSecuritySetup,
        signOut: handleSignOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
