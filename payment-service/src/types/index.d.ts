declare namespace Express {
  export interface Request {
    user?: {
      userId: number; // Or string, depending on your implementation
      [key: string]: any; // Extendable for additional properties
    };
  }
}
