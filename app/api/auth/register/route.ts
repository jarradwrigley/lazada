import bcrypt from "bcryptjs";
import { getMockStorage } from "@/lib/mock-storage";

function generateUserId(): string {
  return "user_" + Math.random().toString(36).substr(2, 9);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, verificationCode, password } = body;
    const storage = getMockStorage();

    if (!email || !verificationCode || !password) {
      return Response.json(
        { message: "Email, verification code, and password are required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase();

    if (!storage.verifiedEmails.has(normalizedEmail)) {
      return Response.json(
        { message: "Email not verified. Please verify your email first." },
        { status: 400 }
      );
    }

    const storedData = storage.verificationCodes.get(normalizedEmail);
    if (!storedData || storedData.code !== verificationCode) {
      return Response.json(
        { message: "Invalid or expired verification code" },
        { status: 400 }
      );
    }

    if (storage.users.has(normalizedEmail)) {
      return Response.json(
        { message: "An account with this email already exists" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return Response.json(
        { message: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);

    if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
      return Response.json(
        {
          message: "Password must contain uppercase, lowercase, and numbers",
        },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const userId = generateUserId();
    const user = {
      id: userId,
      email: normalizedEmail,
      passwordHash,
      createdAt: new Date().toISOString(),
    };

    storage.users.set(normalizedEmail, user);

    storage.verificationCodes.delete(normalizedEmail);
    storage.verifiedEmails.delete(normalizedEmail);

    await new Promise((res) => setTimeout(res, 1000)); // simulate delay

    console.log(`User created: ${normalizedEmail} with ID: ${userId}`);

    return Response.json(
      {
        message: "Account created successfully",
        user: {
          id: user.id,
          email: user.email,
          createdAt: user.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}
