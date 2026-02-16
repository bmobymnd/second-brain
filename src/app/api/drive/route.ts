import { NextResponse } from 'next/server';
import { getTokens, createOrUpdateFile, readFile } from '@/lib/googleDrive';

const STORAGE_FILE = 'mnd-data.json';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, data } = body;

    if (code) {
      // Exchange code for tokens
      const tokens = await getTokens(code);
      return NextResponse.json({ tokens });
    }

    if (data && body.accessToken) {
      // Save data to Drive
      const content = JSON.stringify(data, null, 2);
      const fileId = await createOrUpdateFile(body.accessToken, STORAGE_FILE, content);
      return NextResponse.json({ success: true, fileId });
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  } catch (error) {
    console.error('Drive API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const accessToken = searchParams.get('accessToken');

    if (!accessToken) {
      return NextResponse.json({ error: 'No access token' }, { status: 400 });
    }

    // For now, just return success - we can add file reading later
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Drive API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
