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

export async function POST(request: NextRequest) {
  try {
    await ensureDbInitialized();

    const { rating, comment, sessionToken, captchaToken } = await request.json();
    // Try to capture the best possible IP
    const ipAddress = getClientIp(request);

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Session token required' },
        { status: 401 }
      );
    }

    const user = await dbManager.getUserBySession(sessionToken);
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Valid rating (1-5) is required' },
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

    await dbManager.submitFeedback(user.id, rating, comment, ipAddress);

    return NextResponse.json({
      success: true,
      message: 'Feedback submitted successfully'
    });

  } catch (error) {
    console.error('Feedback API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
