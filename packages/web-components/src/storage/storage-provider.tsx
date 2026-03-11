'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { STORAGE_ITEMS, StorageItemConfig } from './storage-config';
import { StorageKey } from './storage-keys';

type StorageState = Record<StorageKey, any>;

type StorageContextValue = {
  get: <T>(key: StorageKey) => T;
  set: <T>(key: StorageKey, value: T) => void;
  remove: (key: StorageKey) => void;
  isHydrated: boolean;
};

const StorageContext = createContext<StorageContextValue | null>(null);

function getBrowserStorage(item: StorageItemConfig<any>): Storage {
  return item.sessionOnly ? sessionStorage : localStorage;
}

export const StorageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<StorageState>(() => {
    return STORAGE_ITEMS.reduce((acc, item) => {
      acc[item.key] = item.defaultValue;
      return acc;
    }, {} as StorageState);
  });

  const hydrated = useRef(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;

    const hydratedState: StorageState = { ...state };

    for (const item of STORAGE_ITEMS) {
      const storage = getBrowserStorage(item);
      const value = storage.getItem(item.key);

      if (value !== null) {
        hydratedState[item.key] = JSON.parse(value);
      }
    }

    setState(hydratedState);
    setIsHydrated(true);
  }, []);

  const set = <T,>(key: StorageKey, value: T) => {
    const item = STORAGE_ITEMS.find((i) => i.key === key);
    if (!item) return;

    const storage = getBrowserStorage(item);
    storage.setItem(key, JSON.stringify(value));

    setState((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const get = <T,>(key: StorageKey): T => {
    return state[key] as T;
  };

  const remove = (key: StorageKey) => {
    const item = STORAGE_ITEMS.find((i) => i.key === key);
    if (!item) return;

    const storage = getBrowserStorage(item);
    storage.removeItem(key);

    setState((prev) => ({
      ...prev,
      [key]: item.defaultValue,
    }));
  };

  return (
    <StorageContext.Provider value={{ get, set, remove, isHydrated }}>
      {children}
    </StorageContext.Provider>
  );
};

export const useStorage = (): StorageContextValue => {
  const ctx = useContext(StorageContext);
  if (!ctx) {
    throw new Error('useStorage must be used within StorageProvider');
  }
  return ctx;
};
