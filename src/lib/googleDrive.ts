const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

const SCOPES = [
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.metadata.readonly'
].join(' ');

export function getAuthUrl() {
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID!,
    redirect_uri: GOOGLE_REDIRECT_URI!,
    response_type: 'code',
    scope: SCOPES,
    access_type: 'offline',
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

export async function getTokens(code: string) {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: GOOGLE_CLIENT_ID!,
      client_secret: GOOGLE_CLIENT_SECRET!,
      redirect_uri: GOOGLE_REDIRECT_URI!,
      grant_type: 'authorization_code',
    }),
  });
  return response.json();
}

export async function createOrUpdateFile(accessToken: string, fileName: string, content: string) {
  // First, try to find existing file
  const searchResponse = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=name='${fileName}' and trashed=false`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );
  const searchData = await searchResponse.json();
  
  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const metadata = {
    name: fileName,
    mimeType: 'application/json',
  };

  const multipartBody = 
    delimiter + 'Content-Type: application/json\r\n\r\n' + 
    JSON.stringify(metadata) +
    delimiter + 'Content-Type: application/json\r\n\r\n' + 
    content +
    closeDelimiter;

  if (searchData.files && searchData.files.length > 0) {
    // Update existing file
    const fileId = searchData.files[0].id;
    await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart`, {
      method: 'PATCH',
      headers: { 
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary="${boundary}"`,
      },
      body: multipartBody,
    });
    return fileId;
  } else {
    // Create new file
    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: { 
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary="${boundary}"`,
      },
      body: multipartBody,
    });
    const data = await response.json();
    return data.id;
  }
}
