import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    [
      {
        relation: ['delegate_permission/common.handle_all_urls'],
        target: {
          namespace: 'android_app',
          package_name: 'uk.co.skyehosts',
          sha256_cert_fingerprints: [
            'TODO:REPLACE_WITH_SHA256_FINGERPRINT_FROM_PLAY_CONSOLE',
          ],
        },
      },
    ],
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );
}
