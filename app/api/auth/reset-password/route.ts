import bcrypt from "bcryptjs";
import { getMockStorage } from "@/lib/mock-storage";

export async function POST(req: Request) {
  try {
    const { emailOrPhone, verificationCode, newPassword } = await req.json();
    const storage = getMockStorage();

    if (!emailOrPhone || !verificationCode || !newPassword) {
      return Response.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    const normalizedEmail = emailOrPhone.toLowerCase();

    if (!storage.verifiedResets.has(normalizedEmail)) {
      return Response.json(
        { message: "Password reset not verified" },
        { status: 400 }
      );
    }

    const user = storage.users.get(normalizedEmail);
    if (!user) {
      return Response.json({ message: "User not found" }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return Response.json(
        { message: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    user.passwordHash = passwordHash;
    storage.users.set(normalizedEmail, user);

    storage.verificationCodes.delete(normalizedEmail);
    storage.verifiedResets.delete(normalizedEmail);

    await new Promise((res) => setTimeout(res, 1000)); // simulate delay

    console.log(`Password reset for user: ${normalizedEmail}`);

    return Response.json(
      { message: "Password reset successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Reset password error:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}
