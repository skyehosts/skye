"use client";

import { getApiBaseUrl } from "../../../skye-hosts-api-client/src";
import { ChangeEmailSubscriptions } from "@repo/web-components/email-subscriptions/change-email-subscriptions";
import type { ChangeEmailSubscriptionsValues } from "@repo/web-components/email-subscriptions/change-email-subscriptions";
import { useCallback } from "react";
import { useAuth } from "../auth/use-auth";

export function ChangeEmailSubscriptionsWrapper() {
  const { apiToken } = useAuth();

  const handleLoad =
    useCallback(async (): Promise<ChangeEmailSubscriptionsValues> => {
      const res = await fetch(`${getApiBaseUrl()}/user/email-subscriptions`, {
        headers: {
          Authorization: `Bearer ${apiToken}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to load email subscriptions.");
      }

      const data = await res.json();
      return data.payload;
    }, [apiToken]);

  const handleSubmit = async (
    data: ChangeEmailSubscriptionsValues,
  ): Promise<void> => {
    const res = await fetch(`${getApiBaseUrl()}/user/email-subscriptions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiToken}`,
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      throw new Error(
        body?.message ||
          "Failed to save email subscriptions. Please try again.",
      );
    }
  };

  return (
    <ChangeEmailSubscriptions onLoad={handleLoad} onSubmit={handleSubmit} />
  );
}
