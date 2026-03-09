import { Stack } from "expo-router";

export default function SecurityLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: false,
      }}
    >
      <Stack.Screen name="unlock" />
      <Stack.Screen name="pin-unlock" />
      <Stack.Screen name="pin-setup" />
      <Stack.Screen name="biometric-setup" />
    </Stack>
  );
}
