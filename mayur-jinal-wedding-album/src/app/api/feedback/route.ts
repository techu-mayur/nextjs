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

    // For Vercel deployment, be more lenient with session validation
    const isVercel = process.env.VERCEL === '1';
    let user = null;
    
    if (isVercel) {
      // On Vercel, try to get user but don't fail if not found
      try {
        user = await dbManager.getUserBySession(sessionToken);
      } catch (error) {
        console.log('Session not found in Vercel in-memory database, proceeding with anonymous feedback');
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

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Valid rating (1-5) is required' },
        { status: 400 }
      );
    }

    // For Vercel deployment, skip CAPTCHA verification entirely
    if (!isVercel) {
      // Only verify CAPTCHA on local development
      if (!captchaToken) {
        return NextResponse.json(
          { error: 'CAPTCHA verification required' },
          { status: 400 }
        );
      }

      // For local development, verify with Google reCAPTCHA if configured
      if (process.env.NODE_ENV === 'production' && process.env.RECAPTCHA_SECRET_KEY) {
        try {
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
        } catch (error) {
          console.log('reCAPTCHA verification failed, proceeding anyway');
        }
      }
    } else {
      console.log('Skipping CAPTCHA verification for Vercel deployment');
    }

    // If we have a user, submit feedback with user ID, otherwise submit anonymously
    if (user) {
      await dbManager.submitFeedback(user.id, rating, comment, ipAddress);
    } else {
      // For Vercel, create a temporary user ID for anonymous feedback
      const tempUserId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await dbManager.submitFeedback(tempUserId, rating, comment, ipAddress);
    }

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
