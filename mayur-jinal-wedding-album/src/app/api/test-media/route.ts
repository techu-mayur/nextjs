import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Test the media API directly
    const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';
    const mediaUrl = `${baseUrl}/api/media?action=explore&parent=/uploads`;
    
    console.log('Testing media API at:', mediaUrl);
    
    const response = await fetch(mediaUrl);
    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      testUrl: mediaUrl,
      responseStatus: response.status,
      data: data,
      environment: process.env.VERCEL ? 'Vercel' : 'Local',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Test media error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      environment: process.env.VERCEL ? 'Vercel' : 'Local',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
