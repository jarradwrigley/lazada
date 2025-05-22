import { NextRequest, NextResponse } from "next/server";

// In-memory storage for demo
const resetCodes = new Map<
  string,
  { code: string; expires: number; attempts: number }
>();
const rateLimits = new Map<string, { count: number; resetTime: number }>();

export async function POST(request: NextRequest) {
  try {
    const { emailOrPhone } = await request.json();

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (!emailOrPhone) {
      return NextResponse.json(
        { message: "Email or phone number is required" },
        { status: 400 }
      );
    }

    // Rate limiting - max 3 resends per 15 minutes
    const now = Date.now();
    const rateLimit = rateLimits.get(emailOrPhone);

    if (rateLimit) {
      if (now < rateLimit.resetTime) {
        if (rateLimit.count >= 3) {
          const minutesLeft = Math.ceil(
            (rateLimit.resetTime - now) / (60 * 1000)
          );
          return NextResponse.json(
            {
              message: `Too many requests. Please wait ${minutesLeft} minutes before requesting another code.`,
            },
            { status: 429 }
          );
        }
        rateLimit.count += 1;
      } else {
        // Reset the rate limit
        rateLimit.count = 1;
        rateLimit.resetTime = now + 15 * 60 * 1000; // 15 minutes
      }
    } else {
      rateLimits.set(emailOrPhone, {
        count: 1,
        resetTime: now + 15 * 60 * 1000,
      });
    }

    // Generate new code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store the new code
    resetCodes.set(emailOrPhone, { code, expires, attempts: 0 });

    console.log(`🔄 New reset code for ${emailOrPhone}: ${code}`);

    return NextResponse.json(
      {
        message: "New verification code sent successfully",
        debug: process.env.NODE_ENV === "development" ? { code } : undefined,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Resend code error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

