import * as LocalAuthentication from "expo-local-authentication";
import { Platform } from "react-native";
import { getBiometricsEnabled, setBiometricsEnabled } from "./token.service";

export async function isBiometricAvailable(): Promise<boolean> {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  if (!hasHardware) return false;

  const isEnrolled = await LocalAuthentication.isEnrolledAsync();
  return isEnrolled;
}

export async function isBiometricEnabled(): Promise<boolean> {
  const available = await isBiometricAvailable();
  if (!available) return false;
  return getBiometricsEnabled();
}

export async function authenticateWithBiometric(): Promise<boolean> {
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: "Authenticate to unlock",
    fallbackLabel: "Use PIN",
    disableDeviceFallback: true,
  });

  return result.success;
}

export async function enableBiometrics(): Promise<void> {
  await setBiometricsEnabled(true);
}

export async function disableBiometrics(): Promise<void> {
  await setBiometricsEnabled(false);
}

export async function getBiometricType(): Promise<string> {
  const types = await LocalAuthentication.supportedAuthenticationTypesAsync();

  if (Platform.OS === "ios") {
    if (
      types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)
    ) {
      return "Face ID";
    }
    if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      return "Touch ID";
    }
  } else {
    if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      return "Fingerprint";
    }
    if (
      types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)
    ) {
      return "Face Recognition";
    }
  }
  return "Biometrics";
}
