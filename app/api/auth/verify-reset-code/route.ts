import { NextRequest, NextResponse } from "next/server";

// In-memory storage for demo (use database in production)
const resetCodes = new Map<
  string,
  { code: string; expires: number; attempts: number }
>();
const verifiedSessions = new Map<
  string,
  { verified: boolean; expires: number }
>();

export async function POST(request: NextRequest) {
  try {
    const { emailOrPhone, verificationCode } = await request.json();

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Basic validation
    if (!emailOrPhone || !verificationCode) {
      return NextResponse.json(
        { message: "Email/phone and verification code are required" },
        { status: 400 }
      );
    }

    if (verificationCode.length !== 6) {
      return NextResponse.json(
        { message: "Verification code must be 6 digits" },
        { status: 400 }
      );
    }

    // Check if code exists
    const storedData = resetCodes.get(emailOrPhone);
    if (!storedData) {
      return NextResponse.json(
        { message: "No verification code found. Please request a new one." },
        { status: 404 }
      );
    }

    // Check if code has expired
    if (Date.now() > storedData.expires) {
      resetCodes.delete(emailOrPhone);
      return NextResponse.json(
        { message: "Verification code has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Increment attempts
    storedData.attempts += 1;

    // Check maximum attempts (3 attempts allowed)
    if (storedData.attempts > 3) {
      resetCodes.delete(emailOrPhone);
      return NextResponse.json(
        { message: "Too many invalid attempts. Please request a new code." },
        { status: 400 }
      );
    }

    // Verify the code
    if (storedData.code !== verificationCode) {
      return NextResponse.json(
        {
          message: `Invalid verification code. ${
            4 - storedData.attempts
          } attempts remaining.`,
        },
        { status: 400 }
      );
    }

    // Code is valid - create a verified session (valid for 15 minutes)
    const sessionExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
    verifiedSessions.set(emailOrPhone, {
      verified: true,
      expires: sessionExpires,
    });

    console.log(`✅ Code verified for ${emailOrPhone}`);

    return NextResponse.json(
      {
        message: "Verification code verified successfully",
        verified: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Verify reset code error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

