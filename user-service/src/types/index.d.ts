declare namespace Express {
  export interface Request {
    user?: {
      userId: number;
      [key: string]: any;
    };
  }
}
