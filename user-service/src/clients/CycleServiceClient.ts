// src/clients/CycleServiceClient.ts
import axios from "axios";
import { AppError } from "../middleware/errorHandler";

class CycleServiceClient {
  private cycleServiceUrl =
    process.env.CYCLE_SERVICE_URL || "http://localhost:6000/api/";

  async getAvailableCycles(
    filters: {
      location?: string;
      type?: string;
      status?: string;
      brand?: string;
    },
    cookies: string
  ): Promise<any> {
    const response = await axios.get(
      `${this.cycleServiceUrl}/cycles/get-allcycles`,
      {
        params: filters,
        headers: {
          Cookie: cookies, // Include cookies in the headers
        },
      }
    );
    return response.data.data;
  }

  async calculateFare(
    cycleId: number,
    rentalHours: number,
    cookies: string
  ): Promise<any> {
    try {
      const response = await axios.post(
        `${this.cycleServiceUrl}/cycles/calculate-fare`,
        { cycleId, rentalHours },
        {
          headers: {
            Cookie: cookies, // Include cookies in the headers
          },
        }
      );
      return response.data;
    } catch (error: any) {
      throw new AppError(
        error.response?.data?.message || "Failed to calculate fare",
        error.response?.status || 500
      );
    }
  }

  async getUserRentalDetails(rentalID: number, cookies: string): Promise<any> {
    const response = await axios.get(
      `${this.cycleServiceUrl}/cycles/rental/${rentalID}`,
      {
        headers: {
          Cookie: cookies, // Include cookies in the headers
        },
      }
    );
    return response.data.data;
  }
}

export default new CycleServiceClient();
