import * as ImageManipulator from "expo-image-manipulator";
import type {
  IConfirmProfilePhotoUploadRequestDto,
  IRequestProfilePhotoUploadResponseDto,
} from "../../../../packages/skye-hosts-api-client/src";
import { fetchApi } from "./api";
import { readFileAsArrayBuffer, uploadToS3 } from "./image-upload";
import { createLogger } from "./logger";

const log = createLogger("profilePhotoUpload");

const MAX_WIDTH = 512;
const COMPRESS_QUALITY = 0.8;

async function compressProfilePhoto(uri: string): Promise<string> {
  log.debug(`compressing profile photo uri=${uri}`);
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: MAX_WIDTH, height: MAX_WIDTH } }],
    {
      compress: COMPRESS_QUALITY,
      format: ImageManipulator.SaveFormat.JPEG,
    },
  );
  log.debug(`compressed to ${result.uri}`);
  return result.uri;
}

/**
 * Compress, upload to S3 via presigned URL, confirm with API, return profilePhotoUrl.
 */
export async function uploadProfilePhoto(imageUri: string): Promise<string> {
  const compressedUri = await compressProfilePhoto(imageUri);

  const { uploadUrl, photoKey } =
    await fetchApi<IRequestProfilePhotoUploadResponseDto>(
      "/account/profile-photo/request-upload",
      undefined,
      { method: "POST" },
    );

  await uploadToS3(uploadUrl, compressedUri);

  await fetchApi<undefined, IConfirmProfilePhotoUploadRequestDto>(
    "/account/profile-photo/confirm-upload",
    { photoKey },
    { method: "POST" },
  );

  // Fetch the updated account details to get the new photo URL
  const details = await fetchApi<{ profilePhotoUrl: string | null }>(
    "/account/details",
  );
  if (!details.profilePhotoUrl) {
    throw new Error("Profile photo URL not returned after upload");
  }
  return details.profilePhotoUrl;
}
