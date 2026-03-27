import type { IListingImageDto } from "../../../../packages/skye-hosts-api-client/src";
import { useCallback, useEffect, useRef, useState } from "react";
import { captureException } from "../services/error-reporting";
import { createLogger } from "../services/logger";

const log = createLogger("useListingImages");
import { Alert } from "react-native";
import { pickImagesFromGallery } from "../services/image-picker";
import {
  deleteListingImage,
  getListingImages,
  reorderListingImages,
  uploadImages,
  type ImageUploadStatus,
  type LocalImage,
} from "../services/image-upload";
import { handleApiError } from "../utils/form-error-handler";
import { validateImageAspectRatios } from "../utils/image-validation";

const MAX_IMAGES_PER_LISTING = 20;

const POLL_INTERVAL_MS = 3000;
const MAX_POLL_ATTEMPTS = 40; // ~2 minutes at 3s intervals

interface UseListingImagesReturn {
  remoteImages: IListingImageDto[];
  localImages: LocalImage[];
  loading: boolean;
  uploading: boolean;
  error: string;
  totalCount: number;
  canAddMore: boolean;
  processingImageIds: Set<string>;
  pickImages: () => Promise<void>;
  removeLocal: (index: number) => void;
  removeRemote: (imageId: string) => Promise<void>;
  uploadAll: () => Promise<boolean>;
  reorder: (imageIds: string[]) => Promise<void>;
  refresh: () => Promise<void>;
  clearError: () => void;
}

export function useListingImages(listingId: string): UseListingImagesReturn {
  const [remoteImages, setRemoteImages] = useState<IListingImageDto[]>([]);
  const [localImages, setLocalImages] = useState<LocalImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [processingImageIds, setProcessingImageIds] = useState<Set<string>>(
    new Set(),
  );
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollCountRef = useRef<Map<string, number>>(new Map());

  const totalCount = remoteImages.length + localImages.length;
  const canAddMore = totalCount < MAX_IMAGES_PER_LISTING;

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      log.debug("fetching images for listing:", listingId);
      const response = await getListingImages(listingId);
      log.debug("fetched", response.images.length, "images");
      setRemoteImages(response.images);
    } catch (e) {
      log.error("refresh failed:", e);
      handleApiError(e, setError);
    } finally {
      setLoading(false);
    }
  }, [listingId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Poll derived URLs for processing images
  useEffect(() => {
    if (processingImageIds.size === 0) {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
      return;
    }

    const checkDerivedUrls = async () => {
      const resolved: string[] = [];
      const timedOut: string[] = [];

      await Promise.all(
        Array.from(processingImageIds).map(async (imageId) => {
          const count = (pollCountRef.current.get(imageId) ?? 0) + 1;
          pollCountRef.current.set(imageId, count);

          if (count > MAX_POLL_ATTEMPTS) {
            log.error(
              `Image ${imageId} exceeded max poll attempts (${MAX_POLL_ATTEMPTS})`,
            );
            captureException(
              new Error(
                `Image processing timed out for ${imageId} after ${MAX_POLL_ATTEMPTS} attempts`,
              ),
            );
            timedOut.push(imageId);
            return;
          }

          const image = remoteImages.find((img) => img.id === imageId);
          if (!image) return;
          const url640 = image.urls.find((u) => u.width === 640)?.url;
          if (!url640) return;

          try {
            const resp = await fetch(url640, { method: "HEAD" });
            if (resp.ok) {
              resolved.push(imageId);
            }
          } catch {
            // Derived image not ready yet
          }
        }),
      );

      const idsToRemove = [...resolved, ...timedOut];
      if (idsToRemove.length > 0) {
        setProcessingImageIds((prev) => {
          const next = new Set(prev);
          for (const id of idsToRemove) next.delete(id);
          return next;
        });
        for (const id of idsToRemove) {
          pollCountRef.current.delete(id);
        }
      }

      if (timedOut.length > 0) {
        setError("Some images failed to process. Please try re-uploading.");
      }
    };

    pollTimerRef.current = setInterval(checkDerivedUrls, POLL_INTERVAL_MS);

    return () => {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    };
  }, [processingImageIds, remoteImages]);

  const pickImages = useCallback(async () => {
    const maxRemaining = MAX_IMAGES_PER_LISTING - totalCount;
    if (maxRemaining <= 0) {
      setError(`Maximum of ${MAX_IMAGES_PER_LISTING} images reached`);
      return;
    }

    const picked = await pickImagesFromGallery(maxRemaining);
    if (picked.length === 0) return;

    const invalidIndices = new Set(validateImageAspectRatios(picked));
    const valid = picked.filter((_, i) => !invalidIndices.has(i));
    const invalidCount = invalidIndices.size;

    if (invalidCount > 0) {
      if (valid.length === 0) {
        Alert.alert(
          "Photos couldn't be added",
          "The selected photos have aspect ratios outside the supported range (3:4 to 16:9).",
        );
        return;
      }
      Alert.alert(
        "Some photos couldn't be added",
        `${invalidCount} photo${invalidCount !== 1 ? "s" : ""} removed — images must be between 3:4 portrait and 16:9 landscape aspect ratio.\n\n${valid.length} photo${valid.length !== 1 ? "s were" : " was"} successfully added and can be uploaded by tapping 'Upload photos' below.`,
      );
    }

    const newLocals: LocalImage[] = valid.map((img) => ({
      localUri: img.uri,
      width: img.width,
      height: img.height,
      status: "pending" as ImageUploadStatus,
    }));

    setLocalImages((prev) => [...prev, ...newLocals]);
  }, [totalCount]);

  const removeLocal = useCallback((index: number) => {
    setLocalImages((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const removeRemote = useCallback(async (imageId: string) => {
    try {
      await deleteListingImage(imageId);
      setRemoteImages((prev) => prev.filter((img) => img.id !== imageId));
    } catch (e) {
      handleApiError(e, setError);
    }
  }, []);

  const uploadAll = useCallback(async (): Promise<boolean> => {
    const pending = localImages.filter((img) => img.status === "pending");
    if (pending.length === 0) return true;

    setUploading(true);
    setError("");

    try {
      const uploadedIds = await uploadImages(listingId, pending, {
        onStatusChange: (index, status, err) => {
          setLocalImages((prev) =>
            prev.map((img, i) =>
              i === index ? { ...img, status, error: err } : img,
            ),
          );
        },
      });

      const allSucceeded = uploadedIds.length === pending.length;

      // Remove successfully uploaded locals and refresh remote list
      setLocalImages((prev) => prev.filter((img) => img.status !== "done"));
      await refresh();

      // Mark newly uploaded images as processing so we show originals + poll
      if (uploadedIds.length > 0) {
        setProcessingImageIds((prev) => {
          const next = new Set(prev);
          for (const id of uploadedIds) next.add(id);
          return next;
        });
      }

      return allSucceeded;
    } catch (e) {
      handleApiError(e, setError);
      return false;
    } finally {
      setUploading(false);
    }
  }, [localImages, listingId, refresh]);

  const reorder = useCallback(
    async (imageIds: string[]) => {
      try {
        // Optimistically update local state
        const reordered = imageIds
          .map((id) => remoteImages.find((img) => img.id === id))
          .filter(Boolean) as IListingImageDto[];
        setRemoteImages(reordered);

        await reorderListingImages(listingId, imageIds);
      } catch (e) {
        handleApiError(e, setError);
        await refresh();
      }
    },
    [remoteImages, listingId, refresh],
  );

  const clearError = useCallback(() => setError(""), []);

  return {
    remoteImages,
    localImages,
    loading,
    uploading,
    error,
    totalCount,
    canAddMore,
    processingImageIds,
    pickImages,
    removeLocal,
    removeRemote,
    uploadAll,
    reorder,
    refresh,
    clearError,
  };
}
