import { Stack } from "expo-router";
import { CreateListingProvider } from "./context";

export default function CreateListingLayout() {
  return (
    <CreateListingProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </CreateListingProvider>
  );
}
