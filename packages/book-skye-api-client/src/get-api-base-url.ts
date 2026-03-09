export function getApiBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_BOOK_SKYE_API_URL;
  if (!url) {
    throw new Error(
      'NEXT_PUBLIC_BOOK_SKYE_API_URL environment variable is not set. ' +
        'Please set it to the API base URL (e.g. https://api.bookskye.co.uk).',
    );
  }
  return url;
}
