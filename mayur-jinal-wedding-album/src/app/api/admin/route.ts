import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbManager from '@/lib/database';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export const dynamic = 'force-dynamic';

let dbInitialized = false;
async function ensureDbInitialized() {
  if (!dbInitialized) {
    await dbManager.initialize();
    dbInitialized = true;
  }
}

function requireAdmin(request: NextRequest) {
  const auth = request.headers.get('authorization');
  const hasBearer = !!auth && auth.startsWith('Bearer ');
  const token = hasBearer ? auth!.substring(7).trim() : '';
  // In development, allow missing or invalid tokens to ease local testing
  if (process.env.NODE_ENV !== 'production' && (!hasBearer || token === '' || token === 'null' || token === 'undefined')) {
    return { role: 'admin', username: 'dev' } as any;
  }
  if (!hasBearer) return null;
  if (token === '' || token === 'null' || token === 'undefined') return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded.role !== 'admin') return null;
    return decoded;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    await ensureDbInitialized();
    const admin = requireAdmin(request);
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Support multiple sub-resources via query param 'resource'
    const { searchParams } = new URL(request.url);
    const resource = searchParams.get('resource');

    if (resource === 'users') {
      const users = await dbManager.getUsersWithStats();
      return NextResponse.json({ success: true, users });
    }
    if (resource === 'logins') {
      const items = await dbManager.getLoginHistory(100);
      return NextResponse.json({ success: true, items });
    }
    if (resource === 'sessions') {
      const items = await dbManager.getActiveSessions();
      return NextResponse.json({ success: true, items });
    }
    if (resource === 'analytics') {
      const items = await dbManager.getAnalyticsDaily(14);
      return NextResponse.json({ success: true, items });
    }
    if (resource === 'feedback') {
      const items = await dbManager.getAllFeedbackWithUsers();
      return NextResponse.json({ success: true, items });
    }
    if (resource === 'media') {
      const items = await dbManager.getAllMedia();
      return NextResponse.json({ success: true, items });
    }
    return NextResponse.json({ error: 'Unknown resource' }, { status: 400 });
  } catch (e) {
    console.error('Admin GET error', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureDbInitialized();
    const admin = requireAdmin(request);
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { action, userId, mediaId } = body;

    if (action === 'revokeUser') {
      await dbManager.revokeUserSession(userId);
      return NextResponse.json({ success: true });
    }
    if (action === 'deleteUser') {
      await dbManager.deleteUserCascade(userId);
      return NextResponse.json({ success: true });
    }
    if (action === 'deleteMedia') {
      const deleted = await dbManager.deleteMedia(mediaId);
      return NextResponse.json({ success: true, deleted });
    }
    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (e) {
    console.error('Admin POST error', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


