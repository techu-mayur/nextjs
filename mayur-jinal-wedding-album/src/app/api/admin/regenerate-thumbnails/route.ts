import { NextRequest, NextResponse } from 'next/server';
import dbManager from '@/lib/database';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';

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
    
    // Get all media items and regenerate thumbnails for all of them
    const allMedia = await dbManager.getAllMedia();
    
    let updatedCount = 0;
    const thumbsDir = path.join(process.cwd(), 'public', 'uploads', '__thumbs');
    
    if (!fs.existsSync(thumbsDir)) {
      fs.mkdirSync(thumbsDir, { recursive: true });
    }

    for (const item of allMedia) {
      try {
        if (item.filetype === 'image') {
          const fullPath = path.join(process.cwd(), 'public', item.filepath);
          if (fs.existsSync(fullPath)) {
            const thumbName = `${path.parse(item.filename).name}-thumb.jpg`;
            const thumbFsPath = path.join(thumbsDir, thumbName);
            
            // Always regenerate the thumbnail
            await sharp(fullPath).resize(400, 250, { fit: 'cover' }).jpeg({ quality: 70 }).toFile(thumbFsPath);
            
            // Update the database with the new thumb_path
            await dbManager.updateMediaThumbPath(item.id, `/uploads/__thumbs/${thumbName}`);
            updatedCount++;
          }
        } else if (item.filetype === 'video') {
          // For videos, try to generate poster if ffmpeg is available
          const fullPath = path.join(process.cwd(), 'public', item.filepath);
          if (fs.existsSync(fullPath)) {
            try {
              const posterName = `${path.parse(item.filename).name}-poster.jpg`;
              
              
              // Use imported ffmpeg
              await new Promise<void>((resolve, reject) => {
                ffmpeg(fullPath)
                  .on('end', () => resolve())
                  .on('error', () => reject(new Error('ffmpeg error')))
                  .screenshots({
                    timestamps: ['00:00:01.000'],
                    filename: posterName,
                    folder: thumbsDir,
                    size: '640x360'
                  });
              });
              
              await dbManager.updateMediaPosterPath(item.id, `/uploads/__thumbs/${posterName}`);
              updatedCount++;
            } catch (error) {
              console.error(`Failed to generate poster for video ${item.filename}:`, error);
              // Continue without poster
            }
          }
        }
      } catch (error) {
        console.error(`Failed to generate thumbnail for ${item.filename}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully regenerated ${updatedCount} thumbnails`,
      updatedCount
    });

  } catch (error) {
    console.error('Regenerate Thumbnails API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
