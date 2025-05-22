import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";

declare module "next-auth" {
  interface User {
    token?: string;
  }
}

// Mock users for development
const mockUsers = [
  {
    id: "1",
    email: "admin@test.com",
    name: "Admin User",
    username: "admin",
    password: "admin123", // In real app, this would be hashed
    roles: ["Admin", "SuperAdmin"],
    profilePic: "/api/placeholder/100/100",
  },
  {
    id: "2",
    email: "user@test.com",
    name: "Regular User",
    username: "user",
    password: "user123",
    roles: ["User"],
    profilePic: "/api/placeholder/100/100",
  },
  {
    id: "3",
    email: "officer@test.com",
    name: "Account Officer",
    username: "officer",
    password: "officer123",
    roles: ["Account Officer"],
    profilePic: "/api/placeholder/100/100",
  },
];

// Mock authentication function
async function authenticateMockUser(username: string, password: string) {
  const user = mockUsers.find(
    (u) =>
      (u.username === username || u.email === username) &&
      u.password === password
  );

  if (user) {
    // Remove password from returned user object
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
  return null;
}

// Backend authentication function (replace with your actual API call)
async function authenticateBackendUser(username: string, password: string) {
  try {
    // Replace this with your actual backend API call
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      }
    );

    if (response.ok) {
      const userData = await response.json();
      return {
        id: userData.id,
        email: userData.email,
        name: userData.fullname || userData.name,
        username: userData.username,
        roles: userData.roles || ["User"],
        profilePic: userData.profilePic || "/api/placeholder/100/100",
      };
    }
    return null;
  } catch (error) {
    console.error("Backend authentication error:", error);
    return null;
  }
}

// const isDevelopment = process.env.NODE_ENV === "development";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    // Google OAuth (available in all environments)
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),

    // Credentials provider for username/password authentication
    Credentials({
      // id: isDevelopment ? "mock" : "backend",
      // name: isDevelopment ? "Mock Login" : "Credentials",
      id: "mock",
      name: "Mock Login",
      credentials: {
        username: {
          label: "Username or Email",
          type: "text",
          placeholder: "Enter username/email",
        },
        password: {
          label: "Password",
          type: "password",
          placeholder: "Enter password",
        },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        const { username, password } = credentials;

        // if (isDevelopment) {
        // Use mock authentication in development
        return await authenticateMockUser(
          username as string,
          password as string
        );
        // } else {
        //   // Use backend authentication in production
        //   return await authenticateBackendUser(
        //     username as string,
        //     password as string
        //   );
        // }
      },
    }),
  ],

  pages: {
    signIn: "/login",
    error: "/login",
  },

  callbacks: {
    async jwt({ token, user }) {
      // Persist user data in the token
      if (user) {
        token.id = user.id;
        token.username = (user as any).username;
        token.roles = (user as any).roles;
        token.profilePic = (user as any).profilePic;
      }
      return token;
    },

    async session({ session, token }) {
      // Send properties to the client
      if (token) {
        session.user.id = token.id as string;
        (session.user as any).username = token.username;
        (session.user as any).roles = token.roles;
        (session.user as any).profilePic = token.profilePic;
      }
      return session;
    },

    authorized: async ({ auth }) => {
      return !!auth;
    },
  },

  session: {
    strategy: "jwt",
  },

  secret: process.env.NEXTAUTH_SECRET,
});
