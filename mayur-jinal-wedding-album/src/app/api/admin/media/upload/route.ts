import { NextRequest, NextResponse } from 'next/server';
import dbManager from '@/lib/database';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
import ffmpeg from 'fluent-ffmpeg';

export const dynamic = 'force-dynamic';

let dbInitialized = false;
async function ensureDbInitialized() {
  if (!dbInitialized) {
    await dbManager.initialize();
    dbInitialized = true;
  }
}

function ensureDirs() {
  const up = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(up)) fs.mkdirSync(up, { recursive: true });
  const thumbs = path.join(up, '__thumbs');
  if (!fs.existsSync(thumbs)) fs.mkdirSync(thumbs, { recursive: true });
}

export async function POST(request: NextRequest) {
  try {
    await ensureDbInitialized();
    ensureDirs();

    // Resolve ffmpeg and ffprobe dynamically (no static imports)
    try {
      const req = eval('require') as NodeRequire;
      try {
        const ffmpegInstaller = req('@ffmpeg-installer/ffmpeg');
        if (ffmpegInstaller?.path) ffmpeg.setFfmpegPath(ffmpegInstaller.path as string);
      } catch {}
      try {
        const ffprobeInstaller = req('@ffprobe-installer/ffprobe');
        if (ffprobeInstaller?.path) ffmpeg.setFfprobePath(ffprobeInstaller.path as string);
      } catch {}
      try {
        const ffmpegStatic = req('ffmpeg-static');
        if (ffmpegStatic) ffmpeg.setFfmpegPath(ffmpegStatic as string);
      } catch {}
    } catch {}

    // Auth: admin (JWT in header)
    const auth = request.headers.get('authorization');
    if (!auth || !auth.startsWith('Bearer ')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const form = await request.formData();
    const file = form.get('file') as File | null;
    const category = (form.get('category') as string) || 'uncategorized';
    if (!file) return NextResponse.json({ error: 'File is required' }, { status: 400 });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const origName = (form.get('filename') as string) || file.name || `upload-${Date.now()}`;
    const ext = path.extname(origName).toLowerCase();
    const safeName = origName.replace(/[^a-zA-Z0-9_.-]+/g, '_');
    const id = uuidv4();

    const uploadsRoot = path.join(process.cwd(), 'public', 'uploads');
    const fsPath = path.join(uploadsRoot, safeName);
    fs.writeFileSync(fsPath, buffer);

    // Determine type
    const imageExts = new Set(['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp']);
    const videoExts = new Set(['.mp4', '.mov', '.avi', '.webm', '.wmv', '.flv']);
    const filetype = imageExts.has(ext) ? 'image' : (videoExts.has(ext) ? 'video' : null);
    if (!filetype) return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });

    let thumb_path: string | undefined;
    let poster_path: string | undefined;

    if (filetype === 'image') {
      try {
        const thumbName = `${path.parse(safeName).name}-thumb.jpg`;
        const out = path.join(uploadsRoot, '__thumbs', thumbName);
        await sharp(fsPath).resize(400, 250, { fit: 'cover' }).jpeg({ quality: 70 }).toFile(out);
        thumb_path = `/uploads/__thumbs/${thumbName}`;
      } catch {}
    } else {
      try {
        const posterName = `${path.parse(safeName).name}-poster.jpg`;
        const out = path.join(uploadsRoot, '__thumbs', posterName);
        await new Promise<void>((resolve, reject) => {
          try {
            ffmpeg(fsPath)
              .on('end', () => resolve())
              .on('error', (e: any) => reject(e))
            .screenshots({ timestamps: ['00:00:00.500'], filename: posterName, folder: path.join(uploadsRoot, '__thumbs'), size: '640x360' });
          } catch {
            reject(new Error('ffmpeg not available'));
          }
        });
        poster_path = `/uploads/__thumbs/${posterName}`;
      } catch {}
    }

    const mediaItem = {
      id,
      filename: safeName,
      filepath: `/uploads/${safeName}`,
      filetype: filetype as 'image' | 'video',
      filesize: buffer.length,
      upload_date: new Date(),
      face_detected: false,
      category,
      download_count: 0,
      view_count: 0,
      thumb_path,
      preview_path: null as any,
      poster_path,
      duration: null as any,
    };

    await dbManager.addMediaItem(mediaItem);
    return NextResponse.json({ success: true, item: mediaItem });
  } catch (e) {
    console.error('Upload error', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


