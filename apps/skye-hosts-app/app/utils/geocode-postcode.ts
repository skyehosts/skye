import { env } from "../services/env";

export const SKYE_POSTCODE_REGEX = /^IV(4[1-9]|5[1-6])\s?[0-9][A-Z]{2}$/;

export interface GeocodedLocation {
  latitude: number;
  longitude: number;
}

export async function geocodePostcode(
  postcode: string,
): Promise<GeocodedLocation> {
  const apiKey = env.googleMapsApiKey;
  if (!apiKey) {
    throw new Error("Google Maps API key not configured");
  }

  const response = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(postcode)},+Isle+of+Skye,+UK&key=${apiKey}`,
  );
  const data = await response.json();

  if (data.status === "OK" && data.results.length > 0) {
    const { lat, lng } = data.results[0].geometry.location;
    return { latitude: lat, longitude: lng };
  }

  throw new Error("Could not find location for this postcode");
}
