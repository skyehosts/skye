import { Redirect } from "expo-router";

/**
 * Photos are now managed via edit-listing/edit-photos after listing creation.
 * Redirect to the next wizard step if someone navigates here directly.
 */
export default function PhotosScreen() {
  return <Redirect href="/create-new-listing/title" />;
}
