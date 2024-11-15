// user-service/src/services/UserService.ts
import { AppError } from "../middleware/errorHandler";
import { UserFactory } from "../factories/userFactory";
import EmailServiceClient from "../clients/EmailServiceClient";
import { IUserRegistrationData, IUser } from "../dtos/UserRegistrationDTO";
import jwt from "jsonwebtoken";
import prisma from "../clients/prisma";

class UserService {
  async register(userData: IUserRegistrationData): Promise<IUser> {
    try {
      const newUser = await UserFactory.createUser(userData);
      const savedUser = await prisma.user.create({
        data: {
          ...newUser,
        },
      });

      const verificationToken = jwt.sign(
        { userId: savedUser.id },
        process.env.JWT_SECRET as string,
        { expiresIn: "1d" }
      );

      const verificationUrl = `${process.env.BASE_URL}/api/users/verify-email?token=${verificationToken}`;

      await EmailServiceClient.sendVerificationEmail(
        savedUser.email,
        verificationUrl
      );

      return savedUser;
    } catch (error) {
      throw new AppError("Registration failed. Please try again.", 500);
    }
  }

  async getUserByEmail(email: string): Promise<IUser | null> {
    try {
      return await prisma.user.findUnique({
        where: {
          email: email,
        },
      });
    } catch (error) {
      throw new AppError("Failed to retrieve user by email.", 500);
    }
  }

  async verifyEmail(userId: number): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: {
          id: userId,
        },
      });

      if (!user) throw new AppError("User not found.", 404);

      if (user.isVerified) {
        throw new AppError("Email is already verified.", 400);
      }

      await prisma.user.update({
        data: {
          isVerified: true,
        },
        where: {
          id: userId,
        },
      });
    } catch (error) {
      throw new AppError("Email verification failed. Please try again.", 500);
    }
  }
}

export default new UserService();
