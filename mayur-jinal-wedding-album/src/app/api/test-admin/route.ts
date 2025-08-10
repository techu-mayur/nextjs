import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'Admin test endpoint is working',
    environment: process.env.VERCEL ? 'Vercel' : 'Local',
    timestamp: new Date().toISOString()
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    return NextResponse.json({
      success: true,
      message: 'Admin test POST endpoint is working',
      receivedData: {
        username: body.username ? 'PRESENT' : 'MISSING',
        password: body.password ? 'PRESENT' : 'MISSING',
        captchaToken: body.captchaToken ? 'PRESENT' : 'MISSING'
      },
      environment: process.env.VERCEL ? 'Vercel' : 'Local',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to parse request body',
      details: error instanceof Error ? error.message : 'Unknown error',
      environment: process.env.VERCEL ? 'Vercel' : 'Local',
      timestamp: new Date().toISOString()
    }, { status: 400 });
  }
}
