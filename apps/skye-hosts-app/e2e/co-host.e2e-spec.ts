import { expect, test } from "@playwright/test";

const API_BASE = "http://localhost:3003";

// Seeded by e2e-seed.service.ts
const HOST_EMAIL = "host@test.com";
const COHOST_EMAIL = "cohost@test.com";
const PASSWORD = "Password123!";

async function loginWithPassword(
  email: string,
  password: string,
): Promise<string> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(`Login failed for ${email}: ${res.status}`);
  const body = await res.json();
  return body.payload.accessToken as string;
}

async function getListingId(token: string): Promise<number> {
  const res = await fetch(`${API_BASE}/listing`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Failed to fetch listings: ${res.status}`);
  const body = await res.json();
  return body.payload.listings[0].id as number;
}

test.describe("Co-host invite journeys", () => {
  test.beforeEach(async () => {
    const res = await fetch(`${API_BASE}/seed/e2e-reset`, { method: "POST" });
    if (!res.ok) throw new Error(`Seed reset failed: ${res.status}`);
  });

  test("owner can create an invite and get a deep link", async () => {
    const token = await loginWithPassword(HOST_EMAIL, PASSWORD);
    const listingId = await getListingId(token);

    const res = await fetch(`${API_BASE}/co-host-invite`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        listingId,
        inviteeEmail: COHOST_EMAIL,
        role: "full_access",
      }),
    });

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.payload.inviteId).toBeDefined();
    expect(body.payload.inviteLink).toMatch(
      /^skye-hosts:\/\/co-host\/invite-landing\?token=[a-f0-9]{64}$/,
    );
  });

  test("anyone can fetch invite details using the raw token", async () => {
    const token = await loginWithPassword(HOST_EMAIL, PASSWORD);
    const listingId = await getListingId(token);

    const createRes = await fetch(`${API_BASE}/co-host-invite`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        listingId,
        inviteeEmail: COHOST_EMAIL,
        role: "calendar_and_messaging",
      }),
    });
    const { payload: createPayload } = await createRes.json();
    const rawToken = new URL(
      createPayload.inviteLink.replace("skye-hosts://", "http://x/"),
    ).searchParams.get("token")!;

    const detailsRes = await fetch(
      `${API_BASE}/co-host-invite/details/${rawToken}`,
    );
    expect(detailsRes.status).toBe(200);
    const { payload: details } = await detailsRes.json();
    expect(details.listingTitle).toBe("E2E Test Glamping Pod");
    expect(details.inviterName).toBe("Test Host");
    expect(details.role).toBe("calendar_and_messaging");
    expect(details.inviteeEmail).toBe(COHOST_EMAIL);
    expect(details.status).toBe("pending");
  });

  test("authenticated co-host can accept invite and appear in co-hosts list", async () => {
    const hostToken = await loginWithPassword(HOST_EMAIL, PASSWORD);
    const cohostToken = await loginWithPassword(COHOST_EMAIL, PASSWORD);
    const listingId = await getListingId(hostToken);

    // Create invite
    const createRes = await fetch(`${API_BASE}/co-host-invite`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${hostToken}`,
      },
      body: JSON.stringify({
        listingId,
        inviteeEmail: COHOST_EMAIL,
        role: "full_access",
      }),
    });
    const { payload: createPayload1 } = await createRes.json();
    const rawToken = new URL(
      createPayload1.inviteLink.replace("skye-hosts://", "http://x/"),
    ).searchParams.get("token")!;

    // Accept invite as co-host
    const acceptRes = await fetch(`${API_BASE}/co-host-invite/accept`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cohostToken}`,
      },
      body: JSON.stringify({ token: rawToken }),
    });
    expect(acceptRes.status).toBe(201);
    const { payload: acceptBody } = await acceptRes.json();
    expect(acceptBody.listingId).toBe(listingId);
    expect(acceptBody.role).toBe("full_access");

    // Co-host appears in listing co-hosts list
    const coHostsRes = await fetch(
      `${API_BASE}/co-host-invite/co-hosts/${listingId}`,
      {
        headers: { Authorization: `Bearer ${hostToken}` },
      },
    );
    expect(coHostsRes.status).toBe(200);
    const { payload: coHostsBody } = await coHostsRes.json();
    const added = coHostsBody.coHosts.find(
      (c: { accountEmail: string }) => c.accountEmail === COHOST_EMAIL,
    );
    expect(added).toBeDefined();
    expect(added.role).toBe("full_access");
  });

  test("cannot accept invite twice", async () => {
    const hostToken = await loginWithPassword(HOST_EMAIL, PASSWORD);
    const cohostToken = await loginWithPassword(COHOST_EMAIL, PASSWORD);
    const listingId = await getListingId(hostToken);

    const createRes = await fetch(`${API_BASE}/co-host-invite`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${hostToken}`,
      },
      body: JSON.stringify({
        listingId,
        inviteeEmail: COHOST_EMAIL,
        role: "calendar_only",
      }),
    });
    const { payload: cp1 } = await createRes.json();
    const rawToken = new URL(
      cp1.inviteLink.replace("skye-hosts://", "http://x/"),
    ).searchParams.get("token")!;

    // Accept once
    await fetch(`${API_BASE}/co-host-invite/accept`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cohostToken}`,
      },
      body: JSON.stringify({ token: rawToken }),
    });

    // Accept again — should fail
    const secondAccept = await fetch(`${API_BASE}/co-host-invite/accept`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cohostToken}`,
      },
      body: JSON.stringify({ token: rawToken }),
    });
    expect(secondAccept.status).toBe(400);
  });

  test("cannot accept invite sent to a different email", async () => {
    const hostToken = await loginWithPassword(HOST_EMAIL, PASSWORD);
    const listingId = await getListingId(hostToken);

    // Create invite for cohost@test.com but accept as guest@test.com
    const createRes = await fetch(`${API_BASE}/co-host-invite`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${hostToken}`,
      },
      body: JSON.stringify({
        listingId,
        inviteeEmail: COHOST_EMAIL,
        role: "calendar_only",
      }),
    });
    const { payload: cp2 } = await createRes.json();
    const rawToken = new URL(
      cp2.inviteLink.replace("skye-hosts://", "http://x/"),
    ).searchParams.get("token")!;

    const wrongUserToken = await loginWithPassword("guest@test.com", PASSWORD);
    const acceptRes = await fetch(`${API_BASE}/co-host-invite/accept`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${wrongUserToken}`,
      },
      body: JSON.stringify({ token: rawToken }),
    });
    expect(acceptRes.status).toBe(403);
  });

  test("revoked invite cannot be accepted", async () => {
    const hostToken = await loginWithPassword(HOST_EMAIL, PASSWORD);
    const cohostToken = await loginWithPassword(COHOST_EMAIL, PASSWORD);
    const listingId = await getListingId(hostToken);

    const createRes = await fetch(`${API_BASE}/co-host-invite`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${hostToken}`,
      },
      body: JSON.stringify({
        listingId,
        inviteeEmail: COHOST_EMAIL,
        role: "full_access",
      }),
    });
    const { payload: cp3 } = await createRes.json();
    const { inviteId, inviteLink: inviteLink3 } = cp3;
    const rawToken = new URL(
      inviteLink3.replace("skye-hosts://", "http://x/"),
    ).searchParams.get("token")!;

    // Revoke the invite
    const revokeRes = await fetch(`${API_BASE}/co-host-invite/revoke`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${hostToken}`,
      },
      body: JSON.stringify({ inviteId }),
    });
    expect(revokeRes.status).toBe(201);

    // Try to accept the revoked invite
    const acceptRes = await fetch(`${API_BASE}/co-host-invite/accept`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cohostToken}`,
      },
      body: JSON.stringify({ token: rawToken }),
    });
    expect(acceptRes.status).toBe(400);
  });

  test("non-owner cannot create invite", async () => {
    const hostToken = await loginWithPassword(HOST_EMAIL, PASSWORD);
    const cohostToken = await loginWithPassword(COHOST_EMAIL, PASSWORD);
    const listingId = await getListingId(hostToken);

    // Add co-host with calendar_only (no MANAGE_COHOSTS permission)
    const createRes = await fetch(`${API_BASE}/co-host-invite`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${hostToken}`,
      },
      body: JSON.stringify({
        listingId,
        inviteeEmail: COHOST_EMAIL,
        role: "calendar_only",
      }),
    });
    const { payload: cp4 } = await createRes.json();
    const rawToken = new URL(
      cp4.inviteLink.replace("skye-hosts://", "http://x/"),
    ).searchParams.get("token")!;

    await fetch(`${API_BASE}/co-host-invite/accept`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cohostToken}`,
      },
      body: JSON.stringify({ token: rawToken }),
    });

    // Now co-host tries to invite someone else
    const illegalInvite = await fetch(`${API_BASE}/co-host-invite`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cohostToken}`,
      },
      body: JSON.stringify({
        listingId,
        inviteeEmail: "someone@example.com",
        role: "calendar_only",
      }),
    });
    expect(illegalInvite.status).toBe(403);
  });

  test("owner can remove a co-host", async () => {
    const hostToken = await loginWithPassword(HOST_EMAIL, PASSWORD);
    const cohostToken = await loginWithPassword(COHOST_EMAIL, PASSWORD);
    const listingId = await getListingId(hostToken);

    // Create and accept invite
    const createRes = await fetch(`${API_BASE}/co-host-invite`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${hostToken}`,
      },
      body: JSON.stringify({
        listingId,
        inviteeEmail: COHOST_EMAIL,
        role: "full_access",
      }),
    });
    const { payload: cp5 } = await createRes.json();
    const rawToken = new URL(
      cp5.inviteLink.replace("skye-hosts://", "http://x/"),
    ).searchParams.get("token")!;
    await fetch(`${API_BASE}/co-host-invite/accept`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cohostToken}`,
      },
      body: JSON.stringify({ token: rawToken }),
    });

    // Get the listingUserRoleId
    const coHostsRes = await fetch(
      `${API_BASE}/co-host-invite/co-hosts/${listingId}`,
      { headers: { Authorization: `Bearer ${hostToken}` } },
    );
    const {
      payload: { coHosts },
    } = await coHostsRes.json();
    const roleId = coHosts.find(
      (c: { accountEmail: string }) => c.accountEmail === COHOST_EMAIL,
    )?.id;

    // Remove the co-host
    const removeRes = await fetch(`${API_BASE}/co-host-invite/role/${roleId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${hostToken}` },
    });
    expect(removeRes.status).toBe(200);

    // Verify co-host list is now empty
    const afterRes = await fetch(
      `${API_BASE}/co-host-invite/co-hosts/${listingId}`,
      { headers: { Authorization: `Bearer ${hostToken}` } },
    );
    const { payload: afterBody } = await afterRes.json();
    expect(afterBody.coHosts).toHaveLength(0);
  });

  test("unauthenticated request to create invite returns 401", async () => {
    const res = await fetch(`${API_BASE}/co-host-invite`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        listingId: 1,
        inviteeEmail: COHOST_EMAIL,
        role: "full_access",
      }),
    });
    expect(res.status).toBe(401);
  });
});
