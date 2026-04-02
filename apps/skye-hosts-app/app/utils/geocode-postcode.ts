import { env } from "../services/env";

export const SKYE_POSTCODE_REGEX = /^IV(4[1-9]|5[1-6])\s?[0-9][A-Z]{2}$/;

export interface GeocodedLocation {
  latitude: number;
  longitude: number;
}

const STUB_LOCATION: GeocodedLocation = {
  latitude: 57.2737,
  longitude: -6.2155,
};

export async function geocodePostcode(
  postcode: string,
): Promise<GeocodedLocation> {
  console.debug("[geocode] bypassGeocoding =", env.bypassGeocoding);
  if (env.bypassGeocoding) {
    console.debug(
      "[geocode] Bypassing Google geocoding, returning stub location",
    );
    return STUB_LOCATION;
  }
  console.debug("[geocode] Calling Google Geocoding API");

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
