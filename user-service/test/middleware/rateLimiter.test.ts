import express from "express";
import request from "supertest";
import { loginLimiter } from "../../src/middleware/rateLimiter";

describe("rateLimiter middleware", () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();

    app.use(loginLimiter);

    app.get("/", (req, res) => {
      res.status(200).send("OK");
    });
  });

  it("should allow requests under the limit", async () => {
    const response = await request(app).get("/");

    expect(response.status).toBe(200);
    expect(response.text).toBe("OK");
  });

  it("should block requests exceeding the limit", async () => {
    for (let i = 0; i < 5; i++) {
      await request(app).get("/");
    }
    const response = await request(app).get("/");

    expect(response.status).toBe(429);
    expect(response.text).toBe("Too many login attempts, please try again after 15 minutes");
  });
});