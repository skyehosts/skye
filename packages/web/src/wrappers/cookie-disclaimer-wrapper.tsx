"use client";

import { getApiBaseUrl } from "../../../skye-hosts-api-client/src";
import { CookieDisclaimer } from "@repo/web-components/cookie-disclaimer/cookie-disclaimer";
import { useAuth } from "../auth/use-auth";

export function CookieDisclaimerWrapper() {
  const { apiToken, isAuthenticated } = useAuth();

  if (!isAuthenticated) return null;

  const handleResponse = async (accepted: boolean) => {
    const res = await fetch(
      `${getApiBaseUrl()}/user/cookie-usage?enable=${accepted}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiToken}`,
        },
      },
    );

    if (!res.ok) {
      throw new Error("Failed to save cookie preference.");
    }
  };

  return <CookieDisclaimer onResponse={handleResponse} />;
}
