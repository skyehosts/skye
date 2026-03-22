import StorageService, { StorageKeys } from "../services/storage";
import type {
  ListingAmenityId,
  ListingBookingType,
  ListingHighlightId,
  ListingSafetyDisclosureId,
  ListingSpaceType,
  ListingTypeId,
} from "../../../../packages/skye-hosts-api-client/src";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

export function generateDraftId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

/** Set the draft ID before navigating into the wizard. */
let pendingDraftId: string | null = null;

export function setPendingDraftId(id: string): void {
  pendingDraftId = id;
}

function getOrCreateDraftId(): string {
  return pendingDraftId ?? generateDraftId();
}

export interface CreateListingDraft {
  id: string;
  updatedAt: string;
  typeId?: ListingTypeId;
  typeName?: string;
  spaceType?: ListingSpaceType;
  postCode?: string;
  maxGuests?: number;
  bedrooms?: number;
  beds?: number;
  bathrooms?: number;
  amenities?: ListingAmenityId[];
  title?: string;
  highlights?: ListingHighlightId[];
  description?: string;
  bookingType?: ListingBookingType;
  safetyDisclosures?: ListingSafetyDisclosureId[];
  latitude?: number;
  longitude?: number;
}

interface CreateListingContextValue {
  draft: CreateListingDraft;
  setDraftField: <K extends keyof CreateListingDraft>(
    key: K,
    value: CreateListingDraft[K],
  ) => void;
  clearDraft: () => Promise<void>;
}

const CreateListingContext = createContext<CreateListingContextValue | null>(
  null,
);

async function persistDraft(draft: CreateListingDraft): Promise<void> {
  const drafts =
    (await StorageService.getItem<CreateListingDraft[]>(
      StorageKeys.LISTING_DRAFTS,
    )) ?? [];
  const idx = drafts.findIndex((d) => d.id === draft.id);
  if (idx >= 0) {
    drafts[idx] = draft;
  } else {
    drafts.push(draft);
  }
  await StorageService.setItem(StorageKeys.LISTING_DRAFTS, drafts);
}

async function deleteDraft(id: string): Promise<void> {
  const drafts =
    (await StorageService.getItem<CreateListingDraft[]>(
      StorageKeys.LISTING_DRAFTS,
    )) ?? [];
  await StorageService.setItem(
    StorageKeys.LISTING_DRAFTS,
    drafts.filter((d) => d.id !== id),
  );
}

export function CreateListingProvider({ children }: { children: ReactNode }) {
  const [draftId] = useState(() => getOrCreateDraftId());
  const [draft, setDraft] = useState<CreateListingDraft>({
    id: draftId,
    updatedAt: new Date().toISOString(),
  });
  const isLoadedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    StorageService.getItem<CreateListingDraft[]>(
      StorageKeys.LISTING_DRAFTS,
    ).then((drafts) => {
      if (cancelled) return;
      if (drafts) {
        const existing = drafts.find((d) => d.id === draftId);
        if (existing) {
          setDraft(existing);
        }
      }
      isLoadedRef.current = true;
    });
    return () => {
      cancelled = true;
    };
  }, [draftId]);

  const setDraftField = useCallback(
    <K extends keyof CreateListingDraft>(
      key: K,
      value: CreateListingDraft[K],
    ) => {
      setDraft((prev) => {
        const next = {
          ...prev,
          [key]: value,
          updatedAt: new Date().toISOString(),
        };
        if (isLoadedRef.current) {
          persistDraft(next);
        }
        return next;
      });
    },
    [],
  );

  const clearDraft = useCallback(async () => {
    await deleteDraft(draftId);
  }, [draftId]);

  return (
    <CreateListingContext.Provider value={{ draft, setDraftField, clearDraft }}>
      {children}
    </CreateListingContext.Provider>
  );
}

export function useCreateListing() {
  const ctx = useContext(CreateListingContext);
  if (!ctx) {
    throw new Error(
      "useCreateListing must be used within CreateListingProvider",
    );
  }
  return ctx;
}
