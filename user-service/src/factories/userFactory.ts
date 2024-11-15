// src/factories/userFactory.ts
import { IUser } from "../dtos/UserRegistrationDTO";
import bcrypt from "bcryptjs";

export class UserFactory {
  static async createUser(userData: any): Promise<IUser> {
    // Hash the password before creating the user instance
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Create a new user instance
    return {
      ...userData,
      password: hashedPassword,
      role: userData.role || "Customer",
    };
  }
}
