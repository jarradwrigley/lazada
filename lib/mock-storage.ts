interface VerificationData {
  code: string;
  expiresAt: number;
}

interface User {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

// Extend the global interface to include our custom properties
declare global {
    
  var __mockStorage:
    | {
        verificationCodes: Map<string, VerificationData>;
        verifiedEmails: Set<string>;
        verifiedResets: Set<string>;
        users: Map<string, User>;
        existingUsers: Set<string>;
      }
    | undefined;
}

// Initialize mock storage
function initMockStorage() {
  if (!global.__mockStorage) {
    global.__mockStorage = {
      verificationCodes: new Map(),
      verifiedEmails: new Set(),
      verifiedResets: new Set(),
      users: new Map(),
      existingUsers: new Set(),
    };
  }
  return global.__mockStorage;
}

export function getMockStorage() {
  return initMockStorage();
}
