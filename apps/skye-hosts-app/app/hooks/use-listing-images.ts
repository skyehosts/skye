import type { IListingImageDto } from "../../../../packages/skye-hosts-api-client/src";
import { useCallback, useEffect, useState } from "react";
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

const MAX_IMAGES_PER_LISTING = 20;

interface UseListingImagesReturn {
  remoteImages: IListingImageDto[];
  localImages: LocalImage[];
  loading: boolean;
  uploading: boolean;
  error: string;
  totalCount: number;
  canAddMore: boolean;
  pickImages: () => Promise<void>;
  removeLocal: (index: number) => void;
  removeRemote: (imageId: string) => Promise<void>;
  uploadAll: () => Promise<void>;
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

  const totalCount = remoteImages.length + localImages.length;
  const canAddMore = totalCount < MAX_IMAGES_PER_LISTING;

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getListingImages(listingId);
      setRemoteImages(response.images);
    } catch (e) {
      handleApiError(e, setError);
    } finally {
      setLoading(false);
    }
  }, [listingId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const pickImages = useCallback(async () => {
    const maxRemaining = MAX_IMAGES_PER_LISTING - totalCount;
    if (maxRemaining <= 0) {
      setError(`Maximum of ${MAX_IMAGES_PER_LISTING} images reached`);
      return;
    }

    const picked = await pickImagesFromGallery(maxRemaining);
    if (picked.length === 0) return;

    const newLocals: LocalImage[] = picked.map((img) => ({
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

  const uploadAll = useCallback(async () => {
    const pending = localImages.filter((img) => img.status === "pending");
    if (pending.length === 0) return;

    setUploading(true);
    setError("");

    try {
      await uploadImages(listingId, pending, {
        onStatusChange: (index, status, err) => {
          setLocalImages((prev) =>
            prev.map((img, i) =>
              i === index ? { ...img, status, error: err } : img,
            ),
          );
        },
      });

      // Remove successfully uploaded locals and refresh remote list
      setLocalImages((prev) => prev.filter((img) => img.status !== "done"));
      await refresh();
    } catch (e) {
      handleApiError(e, setError);
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
    pickImages,
    removeLocal,
    removeRemote,
    uploadAll,
    reorder,
    refresh,
    clearError,
  };
}
