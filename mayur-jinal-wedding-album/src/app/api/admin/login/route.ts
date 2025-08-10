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
    console.log('Admin login request received');
    
    // Parse request body with better error handling
    let requestBody;
    try {
      requestBody = await request.json();
      console.log('Request body parsed successfully');
    } catch (parseError) {
      console.log('Failed to parse request body:', parseError);
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { username, password, captchaToken } = requestBody;
    console.log('Request data:', { 
      username: username || 'MISSING', 
      password: password ? '[REDACTED]' : 'MISSING', 
      captchaToken: captchaToken ? 'PRESENT' : 'MISSING' 
    });
    
    const ipAddress = getClientIp(request);
    const userAgent = request.headers.get('user-agent') || 'unknown';

    if (!username || !password) {
      console.log('Missing username or password');
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    console.log('Initializing database...');
    await ensureDbInitialized();
    console.log('Database initialized successfully');

    // Verify CAPTCHA with proper reCAPTCHA integration
    if (!captchaToken) {
      console.log('No CAPTCHA token provided');
      return NextResponse.json(
        { error: 'CAPTCHA verification required' },
        { status: 400 }
      );
    }

    // Verify with Google reCAPTCHA if secret key is available
    if (process.env.RECAPTCHA_SECRET_KEY) {
      console.log('Verifying CAPTCHA with Google reCAPTCHA');
      try {
        const recaptchaResponse = await fetch('https://www.google.com/recaptcha/api/siteverify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${captchaToken}`,
        });

        const recaptchaData = await recaptchaResponse.json();
        console.log('reCAPTCHA verification result:', recaptchaData.success);
        
        if (!recaptchaData.success) {
          return NextResponse.json(
            { error: 'CAPTCHA verification failed' },
            { status: 400 }
          );
        }
      } catch (error) {
        console.log('reCAPTCHA verification error:', error);
        return NextResponse.json(
          { error: 'CAPTCHA verification failed' },
          { status: 400 }
        );
      }
    } else {
      console.log('No reCAPTCHA secret key configured, skipping verification');
    }

    console.log('Attempting to authenticate admin user:', username);
    const admin = await dbManager.authenticateAdmin(username, password, ipAddress, userAgent);
    console.log('Authentication result:', admin ? 'SUCCESS' : 'FAILED');

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
