import { NextRequest, NextResponse } from 'next/server';
import dbManager from '@/lib/database';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export const dynamic = 'force-dynamic';

let dbInitialized = false;

async function ensureDbInitialized() {
  if (!dbInitialized) {
    await dbManager.initialize();
    dbInitialized = true;
  }
}

function verifyAdminRequest(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const hasBearer = !!authHeader && authHeader.startsWith('Bearer ');
  const token = hasBearer ? authHeader!.substring(7).trim() : '';
  // Allow missing or invalid token in development to avoid blocking local UI
  if (process.env.NODE_ENV !== 'production' && (!hasBearer || token === '' || token === 'null' || token === 'undefined')) {
    return { role: 'admin', username: 'dev' } as any;
  }
  if (!hasBearer) return null;
  if (token === '' || token === 'null' || token === 'undefined') return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return decoded.role === 'admin' ? decoded : null;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    await ensureDbInitialized();

    const adminData = verifyAdminRequest(request);
    
    if (!adminData) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const stats = await dbManager.getDashboardStats();
    
    return NextResponse.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Admin Dashboard API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
