import type {
  IPinSetupRequestDto,
  IPinSetupResponseDto,
} from "../../../../packages/skye-hosts-api-client/src";
import * as Crypto from "expo-crypto";
import { fetchApi } from "./api";
import {
  deletePinHash,
  deletePinSalt,
  deletePinUserId,
  getPinAttemptCount,
  getPinHash,
  getPinSalt,
  getPinUserId,
  resetPinAttemptCount,
  setPinAttemptCount,
  setPinHash,
  setPinSalt,
  setPinUserId,
} from "./token.service";

const MAX_PIN_ATTEMPTS = 5;

export async function setupPin(pin: string, userId: number): Promise<void> {
  const salt = Crypto.getRandomValues(new Uint8Array(16)).reduce(
    (hex, byte) => hex + byte.toString(16).padStart(2, "0"),
    "",
  );

  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    salt + pin,
  );

  // Save to server
  await fetchApi<IPinSetupResponseDto, IPinSetupRequestDto>("/auth/pin-setup", {
    pinHash: hash,
    pinSalt: salt,
  });

  // Cache locally for offline verification
  await setPinHash(hash);
  await setPinSalt(salt);
  await setPinUserId(String(userId));
  await resetPinAttemptCount();
}

export async function restorePinFromServer(
  pinData: { hash: string; salt: string },
  userId: number,
): Promise<void> {
  await setPinHash(pinData.hash);
  await setPinSalt(pinData.salt);
  await setPinUserId(String(userId));
  await resetPinAttemptCount();
}

export async function verifyPin(pin: string): Promise<boolean> {
  const locked = await isPinLocked();
  if (locked) return false;

  const storedHash = await getPinHash();
  const storedSalt = await getPinSalt();
  if (!storedHash || !storedSalt) return false;

  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    storedSalt + pin,
  );

  if (hash === storedHash) {
    await resetPinAttemptCount();
    return true;
  }

  const attempts = await getPinAttemptCount();
  await setPinAttemptCount(attempts + 1);
  return false;
}

export async function isPinLocked(): Promise<boolean> {
  const attempts = await getPinAttemptCount();
  return attempts >= MAX_PIN_ATTEMPTS;
}

export async function hasPinSetup(): Promise<boolean> {
  const hash = await getPinHash();
  return hash !== null;
}

export async function hasPinForUser(userId: number): Promise<boolean> {
  const hash = await getPinHash();
  if (!hash) return false;
  const storedUserId = await getPinUserId();
  return storedUserId === String(userId);
}

export async function getRemainingAttempts(): Promise<number> {
  const attempts = await getPinAttemptCount();
  return Math.max(0, MAX_PIN_ATTEMPTS - attempts);
}

export async function clearPin(): Promise<void> {
  await deletePinHash();
  await deletePinSalt();
  await deletePinUserId();
  await resetPinAttemptCount();
}
