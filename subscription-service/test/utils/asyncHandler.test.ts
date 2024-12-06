import express, { Request, Response } from "express";
import request from "supertest";
import { asyncHandler } from "../../src/utils/asyncHandler";

describe("asyncHandler utility", () => {
  const app = express();

  beforeAll(() => {
    // Simulate an async route handler using asyncHandler
    app.get(
      "/success",
      asyncHandler(async (req: Request, res: Response) => {
        res.status(200).json({ message: "Success" });
      })
    );

    app.get(
      "/error",
      asyncHandler(async () => {
        throw new Error("Test Error");
      })
    );

    // Error handling middleware
    app.use((err: Error, req: Request, res: Response, next: any) => {
      res.status(500).json({ error: err.message });
    });
  });

  it("should handle successful requests", async () => {
    const response = await request(app).get("/success");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "Success" });
  });

  it("should handle errors thrown by the async route", async () => {
    const response = await request(app).get("/error");
    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: "Test Error" });
  });
});
