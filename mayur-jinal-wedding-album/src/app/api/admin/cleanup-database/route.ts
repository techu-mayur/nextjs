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

export async function POST(request: NextRequest) {
  try {
    await ensureDbInitialized();

    // Query the database directly to get all entries including invalid ones
    const db = (dbManager as any).db;
    if (!db) {
      throw new Error('Database not initialized');
    }

    const allMedia = await db.all('SELECT id, filename, filepath, filetype, category FROM media_items');
    let cleanedCount = 0;
    const cleanedItems: any[] = [];
    
    for (const item of allMedia) {
      // Check if file actually exists
      const filePath = path.join(process.cwd(), 'public', item.filepath.replace(/^\//, ''));
      if (!fs.existsSync(filePath)) {
        console.log(`Removing invalid database entry: ${item.filename} (file not found)`);
        await dbManager.deleteMedia(item.id);
        cleanedCount++;
        cleanedItems.push({ id: item.id, filename: item.filename, reason: 'File not found' });
        continue;
      }
      
      // Check if filename is valid
      if (!isValidFilename(item.filename)) {
        console.log(`Removing invalid database entry: ${item.filename} (invalid filename)`);
        await dbManager.deleteMedia(item.id);
        cleanedCount++;
        cleanedItems.push({ id: item.id, filename: item.filename, reason: 'Invalid filename' });
        continue;
      }
    }
    
    if (cleanedCount > 0) {
      console.log(`Cleaned up ${cleanedCount} invalid database entries`);
    }
    
    return NextResponse.json({
      success: true,
      message: `Database cleanup completed. Removed ${cleanedCount} invalid entries.`,
      cleanedCount,
      cleanedItems
    });

  } catch (error) {
    console.error('Database Cleanup API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
