import { Platform } from "react-native";
import { env } from "./env";

export function getApiBaseUrl(): string {
  const url = env.apiUrl;

  // Android emulator uses 10.0.2.2 to reach the host machine's localhost
  if (Platform.OS === "android") {
    return url
      .replace("localhost", "10.0.2.2")
      .replace("127.0.0.1", "10.0.2.2");
  }

  return url;
}
