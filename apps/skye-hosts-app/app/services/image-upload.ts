import * as ImageManipulator from "expo-image-manipulator";
import type {
  IConfirmListingImageUploadsRequestDto,
  IGetListingImagesResponseDto,
  IRequestListingImageUploadsRequestDto,
  IRequestListingImageUploadsResponseDto,
  IUpdateListingImageOrderRequestDto,
} from "../../../../packages/skye-hosts-api-client/src";
import { fetchApi } from "./api";
import { getErrorMessage } from "../utils/form-error-handler";

const MAX_UPLOAD_WIDTH = 2560;
const COMPRESS_QUALITY = 0.8;
const MAX_CONCURRENT_UPLOADS = 3;

export type ImageUploadStatus =
  | "pending"
  | "compressing"
  | "uploading"
  | "confirming"
  | "done"
  | "error";

export interface LocalImage {
  localUri: string;
  width: number;
  height: number;
  status: ImageUploadStatus;
  imageId?: string;
  uploadUrl?: string;
  error?: string;
}

/**
 * Compress and resize an image to meet upload constraints.
 * Returns a new URI pointing to the processed file.
 */
async function compressImage(uri: string, width: number): Promise<string> {
  const actions: ImageManipulator.Action[] = [];

  if (width > MAX_UPLOAD_WIDTH) {
    actions.push({ resize: { width: MAX_UPLOAD_WIDTH } });
  }

  const result = await ImageManipulator.manipulateAsync(uri, actions, {
    compress: COMPRESS_QUALITY,
    format: ImageManipulator.SaveFormat.JPEG,
  });

  return result.uri;
}

/**
 * Upload a single file to S3 via a presigned PUT URL.
 */
async function uploadToS3(
  presignedUrl: string,
  fileUri: string,
): Promise<void> {
  const response = await fetch(fileUri);
  const blob = await response.blob();

  const uploadResponse = await fetch(presignedUrl, {
    method: "PUT",
    headers: {
      "Content-Type": "image/*",
    },
    body: blob,
  });

  if (!uploadResponse.ok) {
    throw new Error(
      `S3 upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`,
    );
  }
}

/**
 * Run async tasks with a concurrency limit.
 */
async function withConcurrency<T>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<void>,
): Promise<void> {
  const queue = [...items];
  const workers = Array.from(
    { length: Math.min(limit, queue.length) },
    async () => {
      while (queue.length > 0) {
        const item = queue.shift();
        if (item !== undefined) {
          await fn(item);
        }
      }
    },
  );
  await Promise.all(workers);
}

export interface UploadProgressCallback {
  onStatusChange: (
    index: number,
    status: ImageUploadStatus,
    error?: string,
  ) => void;
}

/**
 * Orchestrates the full 3-phase upload:
 * 1. Reserve image slots (request-uploads)
 * 2. Compress & upload each to S3 (parallel, max 3 concurrent)
 * 3. Confirm uploads to trigger processing pipeline
 */
export async function uploadImages(
  listingId: string,
  images: LocalImage[],
  callbacks: UploadProgressCallback,
): Promise<string[]> {
  // Phase 1: Reserve upload slots
  const reserveResponse = await fetchApi<
    IRequestListingImageUploadsResponseDto,
    IRequestListingImageUploadsRequestDto
  >("/listing-image/request-uploads", { listingId, count: images.length });

  // Map server-assigned imageIds back to local images
  const uploadItems = images.map((image, i) => ({
    ...image,
    imageId: reserveResponse.uploads[i].imageId,
    uploadUrl: reserveResponse.uploads[i].uploadUrl,
    index: i,
  }));

  // Phase 2: Compress & upload to S3
  const successfulImageIds: string[] = [];

  await withConcurrency(uploadItems, MAX_CONCURRENT_UPLOADS, async (item) => {
    try {
      callbacks.onStatusChange(item.index, "compressing");
      const compressedUri = await compressImage(item.localUri, item.width);

      callbacks.onStatusChange(item.index, "uploading");
      await uploadToS3(item.uploadUrl, compressedUri);

      successfulImageIds.push(item.imageId);
    } catch (e) {
      callbacks.onStatusChange(
        item.index,
        "error",
        getErrorMessage(e, "Upload failed"),
      );
    }
  });

  if (successfulImageIds.length === 0) {
    throw new Error("All uploads failed");
  }

  // Phase 3: Confirm successful uploads to trigger processing
  for (const item of uploadItems) {
    if (successfulImageIds.includes(item.imageId)) {
      callbacks.onStatusChange(item.index, "confirming");
    }
  }

  await fetchApi<undefined, IConfirmListingImageUploadsRequestDto>(
    "/listing-image/confirm-uploads",
    { imageIds: successfulImageIds },
  );

  for (const item of uploadItems) {
    if (successfulImageIds.includes(item.imageId)) {
      callbacks.onStatusChange(item.index, "done");
    }
  }

  return successfulImageIds;
}

/**
 * Fetch all images for a listing.
 */
export async function getListingImages(
  listingId: string,
): Promise<IGetListingImagesResponseDto> {
  return fetchApi<IGetListingImagesResponseDto>(`/listing-image/${listingId}`);
}

/**
 * Delete a single image.
 */
export async function deleteListingImage(imageId: string): Promise<void> {
  await fetchApi<undefined>(`/listing-image/${imageId}`, undefined, {
    method: "DELETE",
  });
}

/**
 * Reorder images for a listing.
 */
export async function reorderListingImages(
  listingId: string,
  imageIds: string[],
): Promise<void> {
  await fetchApi<undefined, IUpdateListingImageOrderRequestDto>(
    "/listing-image/reorder",
    { listingId, imageIds },
    { method: "PATCH" },
  );
}
