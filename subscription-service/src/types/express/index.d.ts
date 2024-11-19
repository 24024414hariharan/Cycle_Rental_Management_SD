declare namespace Express {
  export interface Request {
    user?: {
      userId: number;
      [key: string]: any; // Optional for additional properties in the JWT payload
    };
  }
}
