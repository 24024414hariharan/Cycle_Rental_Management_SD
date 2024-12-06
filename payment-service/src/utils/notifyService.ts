// src/utils/notifyService.ts
import axios from "axios";

export const notifyService = async (
  url: string,
  payload: object,
  cookies: string
): Promise<void> => {
  try {
    await axios.post(url, payload, {
      headers: { "Content-Type": "application/json", cookie: cookies },
    });
  } catch (err: any) {
    console.error(`Error notifying service at ${url}: ${err.message}`);
    throw new Error(`Failed to notify service at ${url}`);
  }
};
