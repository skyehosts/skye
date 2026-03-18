import * as ImagePicker from "expo-image-picker";
import { Alert, Platform } from "react-native";

export interface PickedImage {
  uri: string;
  width: number;
  height: number;
  fileSize?: number;
  mimeType?: string;
}

/**
 * Request media library permissions, then open the gallery for multi-select.
 * Falls back to single-select on devices that don't support multi-select.
 * Returns an empty array if the user cancels or denies permission.
 */
export async function pickImagesFromGallery(
  maxRemaining: number,
): Promise<PickedImage[]> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (status !== "granted") {
    Alert.alert(
      "Permission required",
      "Please allow access to your photo library in Settings to add photos.",
    );
    return [];
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsMultipleSelection: Platform.OS !== "web",
    selectionLimit: maxRemaining,
    quality: 1,
    exif: false,
  });

  if (result.canceled) {
    return [];
  }

  return result.assets.map((asset) => ({
    uri: asset.uri,
    width: asset.width,
    height: asset.height,
    fileSize: asset.fileSize ?? undefined,
    mimeType: asset.mimeType ?? undefined,
  }));
}
