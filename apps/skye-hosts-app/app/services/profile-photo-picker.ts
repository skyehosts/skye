import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";
import type { PickedImage } from "./image-picker";

/**
 * Open the gallery for single-image selection with square crop UI.
 * Returns null if the user cancels or denies permission.
 */
export async function pickProfilePhoto(): Promise<PickedImage | null> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (status !== "granted") {
    Alert.alert(
      "Permission required",
      "Please allow access to your photo library in Settings to add a profile photo.",
    );
    return null;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    aspect: [1, 1],
    allowsMultipleSelection: false,
    quality: 1,
    exif: false,
  });

  if (result.canceled) {
    return null;
  }

  const asset = result.assets[0];
  return {
    uri: asset.uri,
    width: asset.width,
    height: asset.height,
    fileSize: asset.fileSize ?? undefined,
    mimeType: asset.mimeType ?? undefined,
  };
}
