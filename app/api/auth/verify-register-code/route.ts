import { getMockStorage } from "@/lib/mock-storage";

export async function POST(req: Request) {
  try {
    const { email, verificationCode } = await req.json();
    const storage = getMockStorage();

    // Validation
    if (!email || !verificationCode) {
      return Response.json(
        { message: "Email and verification code are required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase();
    const storedData = storage.verificationCodes.get(normalizedEmail);

    if (!storedData) {
      return Response.json(
        { message: "No verification code found. Please request a new one." },
        { status: 400 }
      );
    }

    // Check if code has expired
    if (Date.now() > storedData.expiresAt) {
      storage.verificationCodes.delete(normalizedEmail);
      return Response.json(
        { message: "Verification code has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Verify the code
    if (storedData.code !== verificationCode) {
      return Response.json(
        { message: "Invalid verification code" },
        { status: 400 }
      );
    }

    // Mark email as verified
    storage.verifiedEmails.add(normalizedEmail);

    await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate delay

    return Response.json(
      { message: "Email verified successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Verify signup code error:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}
