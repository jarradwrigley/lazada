// app/api/auth/send-reset-code/route.ts
import { NextRequest, NextResponse } from "next/server";

// In-memory storage for demo (use database in production)
const resetCodes = new Map<
  string,
  { code: string; expires: number; attempts: number }
>();

export async function POST(request: NextRequest) {
  try {
    const { emailOrPhone } = await request.json();

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Basic validation
    if (!emailOrPhone) {
      return NextResponse.json(
        { message: "Email or phone number is required" },
        { status: 400 }
      );
    }

    // Validate email or phone format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;

    if (!emailRegex.test(emailOrPhone) && !phoneRegex.test(emailOrPhone)) {
      return NextResponse.json(
        { message: "Please enter a valid email or phone number" },
        { status: 400 }
      );
    }

    // Simulate user not found scenario (10% chance)
    if (Math.random() < 0.1) {
      return NextResponse.json(
        { message: "No account found with this email or phone number" },
        { status: 404 }
      );
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store the code
    resetCodes.set(emailOrPhone, { code, expires, attempts: 0 });

    console.log(`🔐 Reset code for ${emailOrPhone}: ${code}`); // For testing

    return NextResponse.json(
      {
        message: "Verification code sent successfully",
        // In production, don't return the code
        debug: process.env.NODE_ENV === "development" ? { code } : undefined,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Send reset code error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

