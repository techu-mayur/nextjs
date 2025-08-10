import { NextRequest, NextResponse } from 'next/server';
import dbManager from '@/lib/database';

let dbInitialized = false;

async function ensureDbInitialized() {
  if (!dbInitialized) {
    await dbManager.initialize();
    dbInitialized = true;
  }
}

export async function GET(request: NextRequest) {
  try {
    await ensureDbInitialized();
    
    // Test database connection by getting categories
    const categories = await dbManager.getCategories();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database connection successful',
      categories: categories,
      environment: process.env.VERCEL ? 'Vercel' : 'Local'
    });
  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Database connection failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        environment: process.env.VERCEL ? 'Vercel' : 'Local'
      },
      { status: 500 }
    );
  }
}
