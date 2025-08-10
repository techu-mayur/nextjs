import { NextRequest, NextResponse } from 'next/server';
import dbManager from '@/lib/database';
import { getClientIp } from '@/app/api/_utils/ip';

let dbInitialized = false;

async function ensureDbInitialized() {
  if (!dbInitialized) {
    await dbManager.initialize();
    dbInitialized = true;
  }
}

// Fallback media data for when database is empty (Vercel in-memory)
const fallbackMediaData = {
  folders: [
    {
      name: "FINAL PHOTOS",
      path: "/uploads/FINAL PHOTOS",
      count: 0,
      thumbnail: null
    }
  ],
  files: [
    {
      id: "1",
      filename: "00-MAYUR  & JINAL  HIGHLIGHT- .mp4",
      filepath: "/uploads/00-MAYUR  & JINAL  HIGHLIGHT- .mp4",
      filetype: "video",
      filesize: 405000000,
      upload_date: new Date().toISOString(),
      face_detected: false,
      category: "videos",
      download_count: 0,
      view_count: 0,
      thumb_path: null,
      preview_path: null,
      poster_path: null,
      duration: null
    },
    {
      id: "2",
      filename: "01-MAYUR & JINAL MANDAP REEL-.mp4",
      filepath: "/uploads/01-MAYUR & JINAL MANDAP REEL-.mp4",
      filetype: "video",
      filesize: 60000000,
      upload_date: new Date().toISOString(),
      face_detected: false,
      category: "videos",
      download_count: 0,
      view_count: 0,
      thumb_path: null,
      preview_path: null,
      poster_path: null,
      duration: null
    },
    {
      id: "3",
      filename: "02-JINAL MAMERA REEL-.mp4",
      filepath: "/uploads/02-JINAL MAMERA REEL-.mp4",
      filetype: "video",
      filesize: 55000000,
      upload_date: new Date().toISOString(),
      face_detected: false,
      category: "videos",
      download_count: 0,
      view_count: 0,
      thumb_path: null,
      preview_path: null,
      poster_path: null,
      duration: null
    },
    {
      id: "4",
      filename: "03-.mp4 MAYUR & JINAL BARAT REEL-mp-4.mp4",
      filepath: "/uploads/03-.mp4 MAYUR & JINAL BARAT REEL-mp-4.mp4",
      filetype: "video",
      filesize: 60000000,
      upload_date: new Date().toISOString(),
      face_detected: false,
      category: "videos",
      download_count: 0,
      view_count: 0,
      thumb_path: null,
      preview_path: null,
      poster_path: null,
      duration: null
    },
    {
      id: "5",
      filename: "04-MAYUR & JINAL WEDDING REEL.mp4",
      filepath: "/uploads/04-MAYUR & JINAL WEDDING REEL.mp4",
      filetype: "video",
      filesize: 77000000,
      upload_date: new Date().toISOString(),
      face_detected: false,
      category: "videos",
      download_count: 0,
      view_count: 0,
      thumb_path: null,
      preview_path: null,
      poster_path: null,
      duration: null
    }
  ]
};

export async function GET(request: NextRequest) {
  try {
    await ensureDbInitialized();
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    
    // If action is 'categories', return all categories
    if (action === 'categories') {
      const categories = await dbManager.getCategories();
      // If no categories in database, return default ones
      if (categories.length === 0) {
        return NextResponse.json({ 
          success: true, 
          categories: ['videos', 'photos', 'FINAL PHOTOS'] 
        });
      }
      return NextResponse.json({ success: true, categories });
    }
    
    // If action is 'explore', return immediate subfolders and files under a path
    if (action === 'explore') {
      // root defaults to '/uploads'
      const root = searchParams.get('root') || '/uploads';
      // parent path to explore
      const parent = searchParams.get('parent') || root;
      const normalizedParent = parent.startsWith('/') ? parent : `/${parent}`;
      
      // Check if we're in Vercel environment and database is empty
      const isVercel = process.env.VERCEL === '1';
      let allMedia = await dbManager.getMediaByPathPrefix(normalizedParent);
      
      // If no media found and we're on Vercel, use fallback data
      if (allMedia.length === 0 && isVercel) {
        console.log('Using fallback media data for Vercel deployment');
        allMedia = fallbackMediaData.files.filter(item => 
          item.filepath.startsWith(normalizedParent)
        );
      }
      
      // Build unique immediate subfolders and files directly under parent
      const folderSet = new Set<string>();
      const folders: Array<{ name: string; path: string; count: number; thumbnail?: string | null; }>= [];
      const files: Array<any> = [];
      
      const parentWithSlash = normalizedParent.replace(/\/+$/, '') + '/';
      for (const item of allMedia) {
        // Remove parent prefix to inspect deeper path
        const remainder = item.filepath.startsWith(parentWithSlash) ? item.filepath.substring(parentWithSlash.length) : item.filepath;
        const segments = remainder.split('/').filter(Boolean);
        if (segments.length > 1) {
          // It's inside a subfolder; collect first segment as folder
          const folderName = segments[0];
          const folderPath = parentWithSlash + folderName;
          if (!folderSet.has(folderPath)) {
            folderSet.add(folderPath);
            folders.push({ name: folderName, path: folderPath, count: 0, thumbnail: null });
          }
        } else if (segments.length === 1) {
          // Direct child file
          files.push(item);
        }
      }
      // Count items inside each folder and choose a thumbnail
      for (const folder of folders) {
        const inside = allMedia.filter(m => m.filepath.startsWith(folder.path + '/'));
        // make unique by filepath
        const uniqueInside = Array.from(new Map(inside.map(m => [m.filepath, m])).values());
        folder.count = uniqueInside.length;
        const thumbItem = uniqueInside.find(m => m.filetype === 'image');
        folder.thumbnail = thumbItem?.thumb_path || thumbItem?.preview_path || thumbItem?.filepath || null;
      }
      
      // Ensure files are unique by filepath
      const uniqueFiles = Array.from(new Map(files.map(f => [f.filepath, f])).values());
      return NextResponse.json({ success: true, parent: normalizedParent, folders, files: uniqueFiles });
    }
    
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '24', 10);
    const category = searchParams.get('category');

    const { items, total } = await dbManager.getMediaPaged(Math.max(1, page), Math.min(100, Math.max(1, pageSize)), category);
    
    // If no items found and we're on Vercel, use fallback data
    if (items.length === 0 && process.env.VERCEL === '1') {
      console.log('Using fallback media data for pagination');
      const fallbackItems = fallbackMediaData.files;
      return NextResponse.json({ 
        success: true, 
        media: fallbackItems, 
        total: fallbackItems.length, 
        page, 
        pageSize 
      });
    }
    
    return NextResponse.json({ success: true, media: items, total, page, pageSize });

  } catch (error) {
    console.error('Media API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureDbInitialized();

    const { action, mediaId, sessionToken } = await request.json();
    const ipAddress = getClientIp(request);
    const userAgent = request.headers.get('user-agent') || 'unknown';

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Session token required' },
        { status: 401 }
      );
    }

    // For Vercel deployment, be more lenient with session validation
    const isVercel = process.env.VERCEL === '1';
    let user = null;
    
    if (isVercel) {
      // On Vercel, try to get user but don't fail if not found
      try {
        user = await dbManager.getUserBySession(sessionToken);
      } catch (error) {
        console.log('Session not found in Vercel in-memory database, proceeding without user tracking');
      }
    } else {
      // On local development, require valid session
      user = await dbManager.getUserBySession(sessionToken);
      if (!user) {
        return NextResponse.json(
          { error: 'Invalid session' },
          { status: 401 }
        );
      }
    }

    if (action === 'view') {
      if (user) {
        await dbManager.logMediaView(user.id, mediaId, ipAddress, userAgent);
      }
      return NextResponse.json({ success: true });
    }

    if (action === 'download') {
      if (user) {
        await dbManager.logMediaDownload(user.id, mediaId, ipAddress, userAgent);
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Media API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
