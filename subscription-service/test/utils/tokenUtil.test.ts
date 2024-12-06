import jwt from "jsonwebtoken";
import {
  generateVerificationToken,
  generateSessionToken,
  verifyToken,
} from "../../src/utils/tokenUtil";

jest.mock("jsonwebtoken");

describe("tokenUtil", () => {
  const userId = "12345";
  const role = "user";
  const secret = "testsecret";
  const verificationToken = "verificationToken";
  const sessionToken = "sessionToken";
  const payload = { userId, role };

  beforeAll(() => {
    process.env.JWT_SECRET = secret;
    process.env.JWT_VERIFICATION_EXPIRY = "24h";
    process.env.JWT_SESSION_EXPIRY = "7d";
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("generateVerificationToken", () => {
    it("should generate a verification token", () => {
      // Explicitly mock the return type of jwt.sign
      (jwt.sign as jest.Mock).mockReturnValue(verificationToken);

      const token = generateVerificationToken(userId);

      expect(jwt.sign).toHaveBeenCalledWith(
        { userId },
        secret,
        { expiresIn: "24h" }
      );
      expect(token).toBe(verificationToken);
    });
  });

  describe("generateSessionToken", () => {
    it("should generate a session token", () => {
      // Explicitly mock the return type of jwt.sign
      (jwt.sign as jest.Mock).mockReturnValue(sessionToken);

      const token = generateSessionToken(userId, role);

      expect(jwt.sign).toHaveBeenCalledWith(
        { userId, role },
        secret,
        { expiresIn: "7d" }
      );
      expect(token).toBe(sessionToken);
    });
  });

  describe("verifyToken", () => {
    it("should verify a valid token", () => {
      // Explicitly mock the return type of jwt.verify
      (jwt.verify as jest.Mock).mockReturnValue(payload);

      const decoded = verifyToken(sessionToken);

      expect(jwt.verify).toHaveBeenCalledWith(sessionToken, secret);
      expect(decoded).toEqual(payload);
    });

    it("should throw an error for an invalid token", () => {
      // Explicitly mock jwt.verify to throw an error
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error("Invalid or expired token.");
      });

      expect(() => verifyToken("invalidToken")).toThrow("Invalid or expired token.");
    });
  });
});
