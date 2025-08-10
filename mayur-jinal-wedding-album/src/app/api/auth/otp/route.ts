import { NextRequest, NextResponse } from 'next/server';
import dbManager from '@/lib/database';
import { getClientIp } from '@/app/api/_utils/ip';

// Initialize database on first request
let dbInitialized = false;

async function ensureDbInitialized() {
  if (!dbInitialized) {
    await dbManager.initialize();
    dbInitialized = true;
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('OTP API called');
    await ensureDbInitialized();
    console.log('Database initialized');

    const body = await request.json();
    console.log('Request body:', body);
    
    const { name, mobile, action, otp } = body;
    const ipAddress = getClientIp(request);

    console.log('Action:', action, 'Name:', name, 'Mobile:', mobile);

    if (!mobile || !name) {
      return NextResponse.json(
        { error: 'Name and mobile number are required' },
        { status: 400 }
      );
    }

    if (action === 'generate') {
      // Generate new OTP
      const generatedOtp = await dbManager.createUser(name, mobile, ipAddress);
      
      // In production, you would send this OTP via SMS
      // For development, we'll return it in the response
      console.log(`OTP for ${mobile}: ${generatedOtp}`);
      
      return NextResponse.json({
        success: true,
        message: 'OTP sent successfully',
        // Always return OTP for easy testing
        otp: generatedOtp
      });
    }

    if (action === 'verify') {
      if (!otp) {
        return NextResponse.json(
          { error: 'OTP is required' },
          { status: 400 }
        );
      }

      const user = await dbManager.verifyOTP(mobile, otp, ipAddress);
      
      if (user) {
        return NextResponse.json({
          success: true,
          message: 'OTP verified successfully',
          user: {
            id: user.id,
            name: user.name,
            mobile: user.mobile,
            sessionToken: user.session_token
          }
        });
      } else {
        return NextResponse.json(
          { error: 'Invalid or expired OTP' },
          { status: 400 }
        );
      }
    }

    if (action === 'resend') {
      const otp = await dbManager.resendOTP(mobile, ipAddress);
      
      // In production, you would send this OTP via SMS
      console.log(`New OTP for ${mobile}: ${otp}`);
      
      return NextResponse.json({
        success: true,
        message: 'OTP resent successfully',
        // Always return OTP for easy testing
        otp: otp
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    console.error('OTP API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
