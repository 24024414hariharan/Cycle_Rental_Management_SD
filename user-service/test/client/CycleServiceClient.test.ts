import axios from "axios";
import CycleServiceClient from "../../src/clients/CycleServiceClient";
import { AppError } from "../../src/middleware/errorHandler";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("CycleServiceClient", () => {
  const cookies = "authToken=mockToken";
  const cycleServiceUrl = process.env.CYCLE_SERVICE_URL || "http://localhost:6000/api/";

  beforeEach(() => {
    jest.clearAllMocks();
  });

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
    });

    it("should throw a default error when response is undefined", async () => {
      const mockError = { response: undefined };

      mockedAxios.post.mockRejectedValueOnce(mockError);

      await expect(
        CycleServiceClient.calculateFare(cycleId, rentalHours, cookies)
      ).rejects.toThrow(new AppError("Failed to calculate fare", 500));
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

  describe("cycleReturn", () => {
    it("should return the cycle successfully", async () => {
      const rentalId = 123;
      const mockResponse = {
        data: { rentalId, status: "Returned", returnTime: "2023-12-07T12:34:56Z" },
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const result = await CycleServiceClient.cycleReturn(rentalId, cookies);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        `${cycleServiceUrl}/cycles/return-cycle`,
        { rentalId },
        {
          headers: { Cookie: cookies },
        }
      );
      expect(result).toEqual(mockResponse.data);
    });

    it("should throw an error with response message and status if cycle return fails", async () => {
      const rentalId = 123;
      const mockError = {
        response: {
          data: { message: "Rental not found" },
          status: 404,
        },
      };

      mockedAxios.post.mockRejectedValueOnce(mockError);

      await expect(CycleServiceClient.cycleReturn(rentalId, cookies)).rejects.toThrow(
        new AppError("Rental not found", 404)
      );
    });

    it("should throw a default error when response is undefined", async () => {
      const rentalId = 123;
      const mockError = { response: undefined };

      mockedAxios.post.mockRejectedValueOnce(mockError);

      await expect(CycleServiceClient.cycleReturn(rentalId, cookies)).rejects.toThrow(
        new AppError("Failed to return the cycle", 500)
      );
    });
  });
});
