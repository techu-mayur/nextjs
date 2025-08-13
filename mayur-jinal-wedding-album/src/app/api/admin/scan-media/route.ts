import { NextRequest, NextResponse } from 'next/server';
import dbManager from '@/lib/database';
import { v4 as uuidv4 } from 'uuid';

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
  const ext = filename.split('.').pop()?.toLowerCase();
  const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'];
  
  return validExtensions.includes(ext || '');
}

// Vercel-compatible media scanning
export async function POST(request: NextRequest) {
  try {
    await ensureDbInitialized();

    // For Vercel deployment, we'll use predefined media data
    // In a real scenario, you would fetch this from your external media hosting
    const predefinedMedia = [
      {
        filename: 'wedding-ceremony-1.jpg',
        filepath: 'https://projects.techumayur.in/mayur-jinal-wedding-album/uploads/wedding-ceremony-1.jpg',
        filetype: 'image' as const,
        filesize: 2048576,
        category: 'Wedding Ceremony',
        thumb_path: 'https://projects.techumayur.in/mayur-jinal-wedding-album/uploads/wedding-ceremony-1.jpg'
      },
      {
        filename: 'wedding-ceremony-2.jpg',
        filepath: 'https://projects.techumayur.in/mayur-jinal-wedding-album/uploads/wedding-ceremony-2.jpg',
        filetype: 'image' as const,
        filesize: 1876543,
        category: 'Wedding Ceremony',
        thumb_path: 'https://projects.techumayur.in/mayur-jinal-wedding-album/uploads/wedding-ceremony-2.jpg'
      },
      {
        filename: 'reception-party.mp4',
        filepath: 'https://projects.techumayur.in/mayur-jinal-wedding-album/uploads/reception-party.mp4',
        filetype: 'video' as const,
        filesize: 52428800,
        category: 'Reception',
        poster_path: 'https://projects.techumayur.in/mayur-jinal-wedding-album/uploads/__thumbs/reception-party-poster.jpg'
      },
      {
        filename: 'couple-photos-1.jpg',
        filepath: 'https://projects.techumayur.in/mayur-jinal-wedding-album/uploads/couple-photos-1.jpg',
        filetype: 'image' as const,
        filesize: 1567890,
        category: 'Couple Photos',
        thumb_path: 'https://projects.techumayur.in/mayur-jinal-wedding-album/uploads/couple-photos-1.jpg'
      },
      {
        filename: 'family-photos-1.jpg',
        filepath: 'https://projects.techumayur.in/mayur-jinal-wedding-album/uploads/family-photos-1.jpg',
        filetype: 'image' as const,
        filesize: 1987654,
        category: 'Family Photos',
        thumb_path: 'https://projects.techumayur.in/mayur-jinal-wedding-album/uploads/family-photos-1.jpg'
      }
    ];

    const mediaItems: any[] = [];
    let addedCount = 0;
    let skippedCount = 0;

    for (const media of predefinedMedia) {
      // Check if media already exists in database
      const existingMedia = await dbManager.getAllMedia();
      const exists = existingMedia.some(item => item.filename === media.filename);
      
      if (exists) {
        skippedCount++;
        continue;
      }

      if (isValidFilename(media.filename)) {
        const mediaItem = {
          id: uuidv4(),
          filename: media.filename,
          filepath: media.filepath,
          filetype: media.filetype,
          filesize: media.filesize,
          upload_date: new Date(),
          face_detected: false,
          category: media.category,
          download_count: 0,
          view_count: 0,
          thumb_path: media.thumb_path,
          poster_path: media.poster_path
        };

        await dbManager.addMediaItem(mediaItem);
        mediaItems.push(mediaItem);
        addedCount++;
      } else {
        skippedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully scanned and added ${addedCount} media items to database. Skipped ${skippedCount} existing/invalid items.`,
      count: addedCount,
      skippedCount,
      items: mediaItems,
      environment: process.env.VERCEL ? 'Vercel' : 'Local'
    });

  } catch (error) {
    console.error('Scan Media API Error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
        environment: process.env.VERCEL ? 'Vercel' : 'Local'
      },
      { status: 500 }
    );
  }
}
