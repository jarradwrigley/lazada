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
const users = new Map<
  string,
  { password: string; email?: string; phone?: string }
>();

export async function POST(request: NextRequest) {
  try {
    const { emailOrPhone, verificationCode, newPassword } =
      await request.json();

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 1200));

    // Basic validation
    if (!emailOrPhone || !verificationCode || !newPassword) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { message: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    // Check if session is verified
    const session = verifiedSessions.get(emailOrPhone);
    if (!session || !session.verified) {
      return NextResponse.json(
        { message: "Please verify your code first" },
        { status: 401 }
      );
    }

    // Check if session has expired
    if (Date.now() > session.expires) {
      verifiedSessions.delete(emailOrPhone);
      return NextResponse.json(
        { message: "Verification session has expired. Please start over." },
        { status: 400 }
      );
    }

    // Double-check the verification code (additional security)
    const storedCode = resetCodes.get(emailOrPhone);
    if (!storedCode || storedCode.code !== verificationCode) {
      return NextResponse.json(
        { message: "Invalid verification code" },
        { status: 400 }
      );
    }

    // Simulate password strength validation
    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasNumber = /\d/.test(newPassword);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

    if (!hasUpperCase || !hasLowerCase || !hasNumber) {
      return NextResponse.json(
        {
          message:
            "Password must contain at least one uppercase letter, one lowercase letter, and one number",
        },
        { status: 400 }
      );
    }

    // Simulate common password check
    const commonPasswords = ["12345678", "password", "qwerty123", "abc123456"];
    if (commonPasswords.includes(newPassword.toLowerCase())) {
      return NextResponse.json(
        { message: "Please choose a more secure password" },
        { status: 400 }
      );
    }

    // Simulate database update failure (2% chance)
    if (Math.random() < 0.02) {
      return NextResponse.json(
        { message: "Unable to update password. Please try again." },
        { status: 500 }
      );
    }

    // Update password in "database"
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmail = emailRegex.test(emailOrPhone);

    users.set(emailOrPhone, {
      password: newPassword, // In production, hash this password!
      ...(isEmail ? { email: emailOrPhone } : { phone: emailOrPhone }),
    });

    // Clean up
    resetCodes.delete(emailOrPhone);
    verifiedSessions.delete(emailOrPhone);

    console.log(`🔑 Password reset successfully for ${emailOrPhone}`);

    return NextResponse.json(
      {
        message: "Password reset successfully",
        success: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

