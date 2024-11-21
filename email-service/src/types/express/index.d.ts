declare namespace Express {
  export interface Request {
    user?: {
      userId: number; // Adjust to string if needed
      [key: string]: any; // Extendable for additional properties
    };
  }
}
