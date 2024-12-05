import axios from "axios";
import CycleServiceClient from "../../src/clients/CycleServiceClient";
import { AppError } from "../../src/middleware/errorHandler";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("CycleServiceClient", () => {
  const cookies = "authToken=mockToken";
  const cycleServiceUrl = process.env.CYCLE_SERVICE_URL || "http://localhost:6000/api/";

  describe("getAvailableCycles", () => {
    it("should fetch available cycles with filters", async () => {
      const filters = { location: "City Center", type: "Mountain" };
      const mockResponse = { data: { data: ["Cycle1", "Cycle2"] } };

      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await CycleServiceClient.getAvailableCycles(filters, cookies);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        `${cycleServiceUrl}/cycles/get-allcycles`,
        {
          params: filters,
          headers: { Cookie: cookies },
        }
      );
      expect(result).toEqual(["Cycle1", "Cycle2"]);
    });
  });

  describe("calculateFare", () => {
    const cycleId = 1;
    const rentalHours = 2;
  
    it("should calculate fare successfully", async () => {
      const mockResponse = { data: { fare: 20 } };
  
      mockedAxios.post.mockResolvedValueOnce(mockResponse);
  
      const result = await CycleServiceClient.calculateFare(cycleId, rentalHours, cookies);
  
      expect(mockedAxios.post).toHaveBeenCalledWith(
        `${cycleServiceUrl}/cycles/calculate-fare`,
        { cycleId, rentalHours },
        {
          headers: { Cookie: cookies },
        }
      );
      expect(result).toEqual({ fare: 20 });
    });
  
    it("should throw an error with a response message and status", async () => {
      const mockError = {
        response: {
          data: { message: "Cycle not found" },
          status: 404,
        },
      };
  
      mockedAxios.post.mockRejectedValueOnce(mockError);
  
      await expect(
        CycleServiceClient.calculateFare(cycleId, rentalHours, cookies)
      ).rejects.toThrow(new AppError("Cycle not found", 404));
  
      expect(mockedAxios.post).toHaveBeenCalledWith(
        `${cycleServiceUrl}/cycles/calculate-fare`,
        { cycleId, rentalHours },
        {
          headers: { Cookie: cookies },
        }
      );
    });
  
    it("should throw a default error when response data is undefined", async () => {
      const mockError = {
        response: undefined, // Simulate undefined response
      };
  
      mockedAxios.post.mockRejectedValueOnce(mockError);
  
      await expect(
        CycleServiceClient.calculateFare(cycleId, rentalHours, cookies)
      ).rejects.toThrow(new AppError("Failed to calculate fare", 500));
  
      expect(mockedAxios.post).toHaveBeenCalledWith(
        `${cycleServiceUrl}/cycles/calculate-fare`,
        { cycleId, rentalHours },
        {
          headers: { Cookie: cookies },
        }
      );
    });
  
    it("should throw a default error when response message is missing", async () => {
      const mockError = {
        response: {
          data: undefined, // Simulate missing data.message
          status: 500,
        },
      };
  
      mockedAxios.post.mockRejectedValueOnce(mockError);
  
      await expect(
        CycleServiceClient.calculateFare(cycleId, rentalHours, cookies)
      ).rejects.toThrow(new AppError("Failed to calculate fare", 500));
  
      expect(mockedAxios.post).toHaveBeenCalledWith(
        `${cycleServiceUrl}/cycles/calculate-fare`,
        { cycleId, rentalHours },
        {
          headers: { Cookie: cookies },
        }
      );
    });
  });

  describe("getUserRentalDetails", () => {
    it("should fetch user rental details successfully", async () => {
      const rentalID = 123;
      const mockResponse = { data: { data: { rentalID, details: "Sample rental details" } } };

      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await CycleServiceClient.getUserRentalDetails(rentalID, cookies);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        `${cycleServiceUrl}/cycles/rental/${rentalID}`,
        {
          headers: { Cookie: cookies },
        }
      );
      expect(result).toEqual({ rentalID, details: "Sample rental details" });
    });
  });
});
