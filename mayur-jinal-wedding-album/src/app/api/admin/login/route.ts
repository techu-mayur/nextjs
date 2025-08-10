import { NextRequest, NextResponse } from 'next/server';
import dbManager from '@/lib/database';
import { getClientIp } from '@/app/api/_utils/ip';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

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

    const { username, password, captchaToken } = await request.json();
    const ipAddress = getClientIp(request);
    const userAgent = request.headers.get('user-agent') || 'unknown';

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Verify CAPTCHA (in production, verify with Google reCAPTCHA)
    if (!captchaToken) {
      return NextResponse.json(
        { error: 'CAPTCHA verification required' },
        { status: 400 }
      );
    }

    // For development, we'll accept any non-empty captcha token
    // In production, verify with Google reCAPTCHA API
    if (process.env.NODE_ENV === 'production') {
      // Verify with Google reCAPTCHA
      const recaptchaResponse = await fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${captchaToken}`,
      });

      const recaptchaData = await recaptchaResponse.json();
      if (!recaptchaData.success) {
        return NextResponse.json(
          { error: 'CAPTCHA verification failed' },
          { status: 400 }
        );
      }
    }

    const admin = await dbManager.authenticateAdmin(username, password, ipAddress, userAgent);

    if (admin) {
      const adminToken = jwt.sign(
        { 
          adminId: admin.id, 
          username: admin.username,
          role: 'admin'
        }, 
        JWT_SECRET, 
        { expiresIn: '8h' }
      );

      return NextResponse.json({
        success: true,
        message: 'Login successful',
        admin: {
          id: admin.id,
          username: admin.username,
          email: admin.email,
          token: adminToken
        }
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

  } catch (error) {
    console.error('Admin Login API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
