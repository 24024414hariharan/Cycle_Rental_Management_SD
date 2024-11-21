import jwt from "jsonwebtoken";

interface TokenPayload {
  userId: string; // JWT payload userId is typically a string
  role?: string; // Optional role field
}

export const generateVerificationToken = (userId: string): string => {
  return jwt.sign({ userId }, process.env.JWT_SECRET as string, {
    expiresIn: process.env.JWT_VERIFICATION_EXPIRY || "24h", // Configurable
  });
};

export const generateSessionToken = (userId: string, role: string): string => {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET as string, {
    expiresIn: process.env.JWT_SESSION_EXPIRY || "7d", // Configurable
  });
};

export const verifyToken = (token: string): TokenPayload => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET as string) as TokenPayload;
  } catch (error) {
    throw new Error("Invalid or expired token.");
  }
};
