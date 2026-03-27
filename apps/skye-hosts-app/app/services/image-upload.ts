import { File as ExpoFile } from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator";
import type {
  IConfirmListingImageUploadsRequestDto,
  IGetListingImagesResponseDto,
  IRequestListingImageUploadsRequestDto,
  IRequestListingImageUploadsResponseDto,
  IUpdateListingImageOrderRequestDto,
} from "../../../../packages/skye-hosts-api-client/src";
import { fetchApi } from "./api";
import { createLogger } from "./logger";
import { captureException } from "./error-reporting";
import { getErrorMessage } from "../utils/form-error-handler";

const log = createLogger("imageUpload");

/**
 * Read a local file URI into an ArrayBuffer using expo-file-system.
 * Isolated so that expo-file-system API changes only require updating this function.
 */
export async function readFileAsArrayBuffer(
  fileUri: string,
): Promise<ArrayBuffer> {
  const file = new ExpoFile(fileUri);
  return file.arrayBuffer();
}

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
  log.debug(`compressing image width=${width} uri=${uri}`);
  const actions: ImageManipulator.Action[] = [];

  if (width > MAX_UPLOAD_WIDTH) {
    actions.push({ resize: { width: MAX_UPLOAD_WIDTH } });
  }

  const result = await ImageManipulator.manipulateAsync(uri, actions, {
    compress: COMPRESS_QUALITY,
    format: ImageManipulator.SaveFormat.JPEG,
  });

  log.debug(`compressed to ${result.uri}`);
  return result.uri;
}

/**
 * Upload a single file to S3 via a presigned PUT URL.
 */
export async function uploadToS3(
  presignedUrl: string,
  fileUri: string,
): Promise<void> {
  const s3Host = new URL(presignedUrl).host;
  const s3Path = new URL(presignedUrl).pathname;
  log.debug(
    `uploadToS3 start host=${s3Host} path=${s3Path} fileUri=${fileUri}`,
  );

  // Step 1: Read file into ArrayBuffer
  let body: ArrayBuffer;
  try {
    body = await readFileAsArrayBuffer(fileUri);
    log.debug(`readFileAsArrayBuffer ok size=${body.byteLength}`);
  } catch (e) {
    log.error("readFileAsArrayBuffer failed:", e);
    throw e;
  }

  // Step 2: Verify S3 host is reachable (lightweight HEAD to the bucket root)
  try {
    log.debug(`connectivity check: HEAD https://${s3Host}/`);
    const probe = await fetch(`https://${s3Host}/`, {
      method: "HEAD",
    }).catch((e: unknown) => {
      log.error("connectivity probe fetch threw:", e);
      return null;
    });
    if (probe) {
      log.debug(
        `connectivity probe status=${probe.status} (expected 403 or similar)`,
      );
    } else {
      log.error("connectivity probe returned null — S3 host unreachable");
    }
  } catch (e) {
    log.error("connectivity probe error:", e);
  }

  // Step 3: Attempt the actual PUT upload
  log.debug(`starting PUT fetch presignedUrl length=${presignedUrl.length}`);
  let response: Response;
  try {
    response = await fetch(presignedUrl, {
      method: "PUT",
      headers: { "Content-Type": "image/jpeg" },
      body,
    });
  } catch (e) {
    log.error(
      "PUT fetch threw (not an HTTP error, a network/transport failure):",
      e instanceof Error
        ? `name=${e.name} message=${e.message} stack=${e.stack}`
        : e,
    );
    throw e;
  }

  log.debug(`PUT response status=${response.status}`);
  if (!response.ok) {
    const body = await response.text().catch(() => "(no body)");
    log.error(`S3 upload failed: ${response.status} body=${body}`);
    throw new Error(`S3 upload failed: ${response.status}`);
  }
  log.debug("S3 upload succeeded");
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
      log.debug(`item ${item.index} (${item.imageId}) completed`);
    } catch (e) {
      captureException(e);
      const msg = getErrorMessage(e, "Upload failed");
      log.debug(`item ${item.index} (${item.imageId}) failed: ${msg}`);
      callbacks.onStatusChange(item.index, "error", msg);
    }
  });

  // Clean up DB records for failed uploads
  const failedImageIds = uploadItems
    .filter((item) => !successfulImageIds.includes(item.imageId))
    .map((item) => item.imageId);

  if (failedImageIds.length > 0) {
    log.debug(`cleaning up ${failedImageIds.length} failed image record(s)`);
    await Promise.all(
      failedImageIds.map((id) =>
        deleteListingImage(id).catch((e) => {
          captureException(e);
        }),
      ),
    );
  }

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
