import NextAuth, { DefaultSession } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { UserRoles } from "./types";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
  }
}

declare module "next-auth" {
  interface User {
    accessToken?: string;
    fullname: string;
    refreshToken: string;
    username: string;
    roles?: UserRoles[];
    phone: string;
  }
}

// Mock user database
const MOCK_USERS = [
  {
    id: "1",
    fullname: "John Doe",
    username: "johndoe",
    email: "john.doe@example.com",
    phone: "+1234567890",
    profilePic: "/api/placeholder/150/150",
    roles: ["user", "admin"],
  },
  {
    id: "2",
    fullname: "Jane Smith",
    username: "janesmith",
    email: "jane.smith@example.com",
    phone: "+1987654321",
    profilePic: "/api/placeholder/150/150",
    roles: ["user"],
  },
  {
    id: "3",
    fullname: "Alice Johnson",
    username: "alicej",
    email: "alice.johnson@example.com",
    phone: "+1122334455",
    profilePic: "/api/placeholder/150/150",
    roles: ["user", "moderator"],
  },
  {
    id: "4",
    fullname: "Bob Wilson",
    username: "bobw",
    email: "bob.wilson@example.com",
    phone: "+1555666777",
    profilePic: "/api/placeholder/150/150",
    roles: ["user"],
  },
  {
    id: "5",
    fullname: "Sarah Davis",
    username: "sarahd",
    email: "sarah.davis@example.com",
    phone: "+1999888777",
    profilePic: "/api/placeholder/150/150",
    roles: ["user", "editor"],
  },
];

const MOCK_PASSWORD = "123456";

// Mock provider for development
const MockProvider = Credentials({
  id: "mock",
  name: "Mock Credentials",
  credentials: {
    username: {
      label: "Email/Phone",
      type: "text",
      placeholder: "Enter email or phone number",
    },
    password: {
      label: "Password",
      type: "password",
    },
  },
  async authorize(credentials: any) {
    try {
      console.log("[Mock Auth] Attempting login with:", credentials?.username);

      if (!credentials?.username || !credentials?.password) {
        console.log("[Mock Auth] Missing credentials");
        throw new Error("Email/phone and password are required");
      }

      // Check password
      if (credentials.password !== MOCK_PASSWORD) {
        console.log("[Mock Auth] Invalid password");
        throw new Error("Invalid password");
      }

      // Find user by email or phone
      const user = MOCK_USERS.find(
        (u) =>
          u.email.toLowerCase() === credentials.username.toLowerCase() ||
          u.phone === credentials.username ||
          u.username.toLowerCase() === credentials.username.toLowerCase()
      );

      if (!user) {
        console.log("[Mock Auth] User not found");
        throw new Error("User not found");
      }

      console.log("[Mock Auth] Login successful for:", user.email);

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Return user object that will be stored in the JWT
      return {
        id: user.id,
        email: user.email,
        name: user.fullname,
        image: user.profilePic,
        // Custom fields
        fullname: user.fullname,
        username: user.username,
        phone: user.phone,
        roles: user.roles,
      } as any;
    } catch (error) {
      console.error("[Mock Auth] Authentication failed:", error);
      // Return null to indicate authentication failed
      return null;
    }
  },
});

// Production backend provider (skeletal structure)
const BackendProvider = Credentials({
  id: "backend",
  name: "Backend Credentials",
  credentials: {
    username: {
      label: "Email/Phone",
      type: "text",
    },
    password: {
      label: "Password",
      type: "password",
    },
  },
  async authorize(credentials) {
    try {
      if (!credentials?.username || !credentials?.password) {
        throw new Error("Email/phone and password are required");
      }

      // Make API call to your backend authentication endpoint
      const response = await fetch(
        `${process.env.BACKEND_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            identifier: credentials.username, // email or phone
            password: credentials.password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Authentication failed");
      }

      // Backend should return user data and tokens
      if (data.success && data.user) {
        return {
          id: data.user.id,
          email: data.user.email,
          name: data.user.fullname,
          image: data.user.profilePic,
          // Custom fields from your backend
          fullname: data.user.fullname,
          username: data.user.username,
          phone: data.user.phone,
          roles: data.user.roles,
          // Store tokens for API calls
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        };
      }

      return null;
    } catch (error) {
      console.error("[Backend Auth] Authentication failed:", error);
      return null;
    }
  },
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
    // Use mock provider in development, backend in production
    process.env.NODE_ENV === "development" ? MockProvider : BackendProvider,
  ],
  pages: {
    signIn: "/login",
    error: "/login", // Redirect to login page on error
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        return {
          ...token,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          user: {
            id: user.id,
            email: user.email,
            fullname: user.fullname,
            username: user.username,
            phone: user.phone,
            profilePic: user.image,
            roles: user.roles,
          },
        };
      }

      // Return previous token if the access token has not expired yet
      return token;
    },

    async session({ session, token }) {
      // Send properties to the client
      session.user = token.user as any;
      session.accessToken = token.accessToken as string;

      return session;
    },

    async authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnLoginPage = nextUrl.pathname.startsWith("/login");
      const isOnSignupPage = nextUrl.pathname.startsWith("/signup");
      const isOnPublicPage =
        nextUrl.pathname === "/" || nextUrl.pathname.startsWith("/public");

      // Allow access to login/signup pages when not logged in
      if (!isLoggedIn && (isOnLoginPage || isOnSignupPage || isOnPublicPage)) {
        return true;
      }

      // Redirect to login if not logged in and trying to access protected pages
      if (!isLoggedIn) {
        return false;
      }

      // Redirect to home if logged in and trying to access login/signup
      if (isLoggedIn && (isOnLoginPage || isOnSignupPage)) {
        return Response.redirect(new URL("/", nextUrl));
      }

      return true;
    },
  },
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      console.log(`[Auth Event] User signed in:`, user.email);
    },
    //@ts-ignore
    async signOut({ token }) {
      // Since you're using JWT strategy, only token is available in signOut event
      console.log(`[Auth Event] User signed out:`, token?.user?.email);
    },
  },
});

// Export mock users for testing purposes
export { MOCK_USERS, MOCK_PASSWORD };
