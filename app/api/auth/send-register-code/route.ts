import { getMockStorage } from "@/lib/mock-storage";

// Generate random 6-digit code
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    const storage = getMockStorage();

    if (!email) {
      return Response.json({ message: "Email is required" }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return Response.json(
        { message: "Invalid email format" },
        { status: 400 }
      );
    }

    if (storage.users.has(email.toLowerCase())) {
      return Response.json(
        { message: "An account with this email already exists" },
        { status: 400 }
      );
    }

    const code = generateVerificationCode();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    storage.verificationCodes.set(email.toLowerCase(), { code, expiresAt });

    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate delay

    console.log(`Verification code for ${email}: ${code}`);

    return Response.json(
      {
        message: "Verification code sent successfully",
        debug: { code }, // Remove this in production
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Send signup code error:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}
