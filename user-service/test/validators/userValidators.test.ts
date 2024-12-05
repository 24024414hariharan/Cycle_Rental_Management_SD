import request from "supertest";
import express, { Request, Response } from "express";
import {
  registerValidator,
  loginValidator,
} from "../../src/validators/userValidators";
import { validationResult } from "express-validator";

// Helper function to create a test app
const createTestApp = (validators: any[]) => {
  const app = express();
  app.use(express.json());
  app.post("/test", validators, (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("Validation Errors:", errors.array());
      return res.status(400).json({ errors: errors.array() });
    }
    res.status(200).json({ message: "Validation passed" });
  });
  return app;
};

describe("User Validators", () => {
  describe("registerValidator", () => {
    let app: ReturnType<typeof createTestApp>;

    beforeAll(() => {
      app = createTestApp(registerValidator);
    });

    it("should pass with valid input", async () => {
      const response = await request(app).post("/test").send({
        email: "test@example.com",
        password: "ValidPass1@", // Meets criteria
        name: "John Doe",
        dateOfBirth: "1990-01-01",
        phoneNumber: "1234567890",
        identification: "ID12345",
      });
      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Validation passed");
    });

    it("should fail when email is invalid", async () => {
      const response = await request(app).post("/test").send({
        email: "invalid-email",
        password: "ValidPassword1@",
        name: "John Doe",
        dateOfBirth: "1990-01-01",
        phoneNumber: "1234567890",
        identification: "ID12345",
      });
      expect(response.status).toBe(400);
      expect(response.body.errors[0].msg).toBe("Must be a valid email");
    });

    it("should fail when password is too short", async () => {
      const response = await request(app).post("/test").send({
        email: "test@example.com",
        password: "short",
        name: "John Doe",
        dateOfBirth: "1990-01-01",
        phoneNumber: "1234567890",
        identification: "ID12345",
      });
      expect(response.status).toBe(400);
      expect(response.body.errors[0].msg).toBe(
        "Password must be 8-32 characters long"
      );
    });
  });

  describe("loginValidator", () => {
    let app: ReturnType<typeof createTestApp>;

    beforeAll(() => {
      app = createTestApp(loginValidator);
    });

    it("should pass with valid input", async () => {
      const response = await request(app).post("/test").send({
        email: "test@example.com",
        password: "Password@123", // Meets criteria
      });
      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Validation passed");
    });

    it("should fail when email is missing", async () => {
      const response = await request(app).post("/test").send({
        password: "ValidPassword1@", // Valid password
      });
      expect(response.status).toBe(400);
      expect(response.body.errors[0].msg).toBe("Must be a valid email");
    });

    it("should fail when password is missing", async () => {
      const response = await request(app).post("/test").send({
        email: "test@example.com", // Valid email
      });
      console.log(response.body); // Log the response for debugging
      expect(response.status).toBe(400);
      expect(response.body.errors[0].msg).toBe("Password is required");
    });
  });
});
