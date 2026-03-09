export function isTokenExpired(token: string): boolean {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return true;

    const payload = JSON.parse(atob(parts[1]));
    if (!payload.exp) return true;

    const expiryMs = payload.exp * 1000;
    const bufferMs = 60 * 1000; // 1 minute buffer
    return Date.now() >= expiryMs - bufferMs;
  } catch {
    return true;
  }
}
