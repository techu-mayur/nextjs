import { NextRequest, NextResponse } from 'next/server';
import dbManager from '@/lib/database';
import fs from 'fs';
import path from 'path';

let dbInitialized = false;
async function ensureDbInitialized() {
  if (!dbInitialized) {
    await dbManager.initialize();
    dbInitialized = true;
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureDbInitialized();
    const { mediaId, dataUrl, sessionToken } = await request.json();
    if (!mediaId || !dataUrl || !sessionToken) return NextResponse.json({ error: 'Missing params' }, { status: 400 });

    const user = await dbManager.getUserBySession(sessionToken);
    if (!user) return NextResponse.json({ error: 'Invalid session' }, { status: 401 });

    const item = await dbManager.getMediaById(mediaId);
    if (!item) return NextResponse.json({ error: 'Media not found' }, { status: 404 });

    // Save poster under __thumbs
    const thumbsDir = path.join(process.cwd(), 'public', 'uploads', '__thumbs');
    if (!fs.existsSync(thumbsDir)) fs.mkdirSync(thumbsDir, { recursive: true });
    const posterName = `${mediaId}-poster-client.jpg`;
    const posterFsPath = path.join(thumbsDir, posterName);

    const base64 = dataUrl.split(',')[1];
    const buffer = Buffer.from(base64, 'base64');
    fs.writeFileSync(posterFsPath, buffer);

    const posterPath = `/uploads/__thumbs/${posterName}`;
    // Update DB
    await dbManager.addMediaItem({
      id: item.id,
      filename: item.filename,
      filepath: item.filepath,
      filetype: item.filetype as any,
      filesize: item.filesize as any,
      upload_date: new Date(item.upload_date as any),
      face_detected: !!item.face_detected,
      category: item.category,
      download_count: item.download_count as any,
      view_count: item.view_count as any,
      thumb_path: item.thumb_path || null,
      preview_path: item.preview_path || null,
      poster_path: posterPath,
      duration: item.duration || null,
    });

    return NextResponse.json({ success: true, posterPath });
  } catch (e) {
    console.error('Poster upload error', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


