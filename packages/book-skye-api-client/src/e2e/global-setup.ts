const API_URL = 'http://localhost:3003';

export default async function globalSetup() {
  const response = await fetch(`${API_URL}/seed/e2e-reset`, {
    method: 'POST',
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`E2E seed reset failed (${response.status}): ${text}`);
  }
}
