import { NextRequest, NextResponse } from 'next/server';
import dbManager from '@/lib/database';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
import ffmpeg from 'fluent-ffmpeg';

let dbInitialized = false;
async function ensureDbInitialized() {
  if (!dbInitialized) {
    await dbManager.initialize();
    dbInitialized = true;
  }
}

// Helper function to validate filename
function isValidFilename(filename: string): boolean {
  // Check for common invalid patterns
  if (filename.startsWith('.') || 
      filename.startsWith('_') || 
      filename.startsWith('._') ||
      filename.toLowerCase() === 'thumbs.db' || 
      filename.toLowerCase() === 'desktop.ini' ||
      filename.includes('__MACOSX') ||
      filename.includes('DS_Store')) {
    return false;
  }
  
  // Check for valid file extensions
  const ext = path.extname(filename).toLowerCase();
  const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm'];
  
  return validExtensions.includes(ext);
}

// Helper function to clean up invalid database entries
async function cleanupInvalidEntries() {
  try {
    const allMedia = await dbManager.getAllMedia();
    let cleanedCount = 0;
    
    for (const item of allMedia) {
      // Check if file actually exists
      const filePath = path.join(process.cwd(), 'public', item.filepath.replace(/^\//, ''));
      if (!fs.existsSync(filePath)) {
        console.log(`Removing invalid database entry: ${item.filename} (file not found)`);
        await dbManager.deleteMedia(item.id);
        cleanedCount++;
        continue;
      }
      
      // Check if filename is valid
      if (!isValidFilename(item.filename)) {
        console.log(`Removing invalid database entry: ${item.filename} (invalid filename)`);
        await dbManager.deleteMedia(item.id);
        cleanedCount++;
        continue;
      }
    }
    
    if (cleanedCount > 0) {
      console.log(`Cleaned up ${cleanedCount} invalid database entries`);
    }
    
    return cleanedCount;
  } catch (error) {
    console.error('Error during cleanup:', error);
    return 0;
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureDbInitialized();

    // First, clean up any invalid entries
    const cleanedCount = await cleanupInvalidEntries();

    // Resolve ffmpeg and ffprobe binaries dynamically at runtime to avoid build-time module resolution issues
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
      // Fallback to ffmpeg-static if available
      try {
        const ffmpegStatic = req('ffmpeg-static');
        if (ffmpegStatic) ffmpeg.setFfmpegPath(ffmpegStatic as string);
      } catch {}
    } catch {}

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    const mediaItems: any[] = [];
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    async function scanDirectory(dirPath: string) {
      const items = fs.readdirSync(dirPath);
      for (const item of items) {
        const fullPath = path.join(dirPath, item);
        const stat = fs.statSync(fullPath);

        // Skip hidden/system directories and generated thumbs
        const baseName = path.basename(fullPath);
        if (stat.isDirectory()) {
          if (baseName.startsWith('.') || baseName.toLowerCase() === '__thumbs') continue;
          await scanDirectory(fullPath);
        } else if (stat.isFile()) {
          // Enhanced filtering for invalid files
          if (!isValidFilename(item)) {
            console.log(`Skipping invalid file: ${item}`);
            continue;
          }
          
          const ext = path.extname(item).toLowerCase();
          const isImage = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'].includes(ext);
          const isVideo = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm'].includes(ext);

          if (isImage || isVideo) {
            const relativePath = path.relative(path.join(process.cwd(), 'public'), fullPath);
            const fileType = isImage ? 'image' : 'video';
            const normalizedPath = `/${relativePath.replace(/\\/g, '/')}`;
            const relFromUploads = normalizedPath.replace(/^\/+/, '');
            const parts = relFromUploads.split('/');
            let topLevel = 'Uncategorized';
            if (parts.length > 0) {
              if (parts[0] === 'uploads') {
                topLevel = parts[1] || 'Uncategorized';
              } else {
                topLevel = parts[0] || 'Uncategorized';
              }
            }

            let thumb_path: string | undefined;
            let poster_path: string | undefined;

            const thumbsDir = path.join(process.cwd(), 'public', 'uploads', '__thumbs');
            if (!fs.existsSync(thumbsDir)) fs.mkdirSync(thumbsDir, { recursive: true });

            if (isImage) {
              const thumbName = `${path.parse(item).name}-thumb.jpg`;
              const thumbFsPath = path.join(thumbsDir, thumbName);
              try {
                await sharp(fullPath).resize(400, 250, { fit: 'cover' }).jpeg({ quality: 70 }).toFile(thumbFsPath);
                thumb_path = `/uploads/__thumbs/${thumbName}`;
              } catch (error) {
                console.error(`Failed to generate thumbnail for ${item}:`, error);
              }
            } else if (isVideo) {
              try {
                // Try to generate poster via ffmpeg if path was configured successfully
                const posterName = `${path.parse(item).name}-poster.jpg`;
                const posterFsPath = path.join(thumbsDir, posterName);
                await new Promise<void>((resolve, reject) => {
                  try {
                    ffmpeg(fullPath)
                      .on('end', () => resolve())
                      .on('error', () => reject(new Error('ffmpeg error')))
                      .screenshots({
                        timestamps: ['00:00:01.000'],
                        filename: posterName,
                        folder: thumbsDir,
                        size: '640x360' // 16:9 to avoid stretching
                      });
                  } catch {
                    reject(new Error('ffmpeg not available'));
                  }
                });
                poster_path = `/uploads/__thumbs/${posterName}`;
              } catch (error) {
                console.error(`Failed to generate poster for ${item}:`, error);
                // Poster generation failed or ffmpeg not available; continue without poster
              }
            }

            mediaItems.push({
              id: uuidv4(),
              filename: item,
              filepath: normalizedPath,
              filetype: fileType,
              filesize: stat.size,
              upload_date: new Date(),
              face_detected: false,
              category: topLevel,
              download_count: 0,
              view_count: 0,
              thumb_path,
              poster_path
            });
          }
        }
      }
    }

    // Scan the uploads directory
    await scanDirectory(uploadsDir);

    // Add media items to database
    for (const item of mediaItems) {
      await dbManager.addMediaItem(item);
    }

    return NextResponse.json({
      success: true,
      message: `Successfully scanned and added ${mediaItems.length} media items to database. Cleaned up ${cleanedCount} invalid entries.`,
      count: mediaItems.length,
      cleanedCount,
      items: mediaItems
    });

  } catch (error) {
    console.error('Scan Media API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
