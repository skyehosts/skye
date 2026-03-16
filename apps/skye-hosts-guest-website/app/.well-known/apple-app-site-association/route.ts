import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    {
      applinks: {
        apps: [],
        details: [
          {
            appID: 'TEAM_ID.uk.co.skyehosts',
            paths: ['/invite*'],
          },
        ],
      },
    },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );
}
