import prisma from "../clients/prisma";
import bcrypt from "bcryptjs";
import { UserFactoryProvider } from "../factories/userFactory";
import { AppError } from "../middleware/errorHandler";
import {
  verifyToken,
  generateVerificationToken,
  generateSessionToken,
} from "../utils/tokenUtil";
import {
  IUser,
  IUserRegistrationData,
  IUserUpdateData,
  IUpdateUserRoleData,
} from "../dtos/UserRegistrationDTO";
import { Role } from "@prisma/client";
import EmailServiceClient from "../clients/EmailServiceClient";



class UserService {
  private static instance: UserService;

  private constructor() {}

  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  async register(userData: IUserRegistrationData): Promise<void> {
    const role = (userData.role || "CUSTOMER").toUpperCase() as Role;
    const userFactory = UserFactoryProvider.getFactory(role);

    const newUser = await userFactory.createUser(userData);
    const verificationToken = generateVerificationToken(newUser.id.toString());
    const verificationUrl = `${process.env.BASE_URL}/api/users/verify-email?token=${verificationToken}`;

    await EmailServiceClient.sendVerificationEmail(
      newUser.email,
      verificationUrl,
      newUser.name
    );
    console.log(`Verification Email Sent: ${verificationUrl}`);
  }

  async getUserByEmail(email: string): Promise<IUser | null> {
    return await prisma.user.findUnique({
      where: { email },
    });
  }

  async comparePasswords(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  async verifyEmailToken(token: string): Promise<void> {
    const { userId } = verifyToken(token);

    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
    });
    if (!user) throw new AppError("User not found.", 404);
    if (user.isVerified) throw new AppError("Email is already verified.", 400);

    await prisma.user.update({
      where: { id: Number(userId) },
      data: { isVerified: true },
    });
  }

  async sendPasswordResetEmail(email: string): Promise<void> {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return;

    const resetToken = generateVerificationToken(user.id.toString());
    const resetUrl = `${process.env.BASE_URL}/api/users/reset-password?token=${resetToken}`;

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpires: new Date(Date.now() + 3600 * 1000),
      },
    });

    await EmailServiceClient.sendPasswordResetEmail(
      user.email,
      resetUrl,
      user.name
    );

    console.log(`Password Reset Link: ${resetUrl}`);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const { userId } = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
    });
    if (
      !user ||
      !user.passwordResetToken ||
      new Date() > user.passwordResetExpires!
    ) {
      throw new AppError("Invalid or expired reset token.", 400);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: Number(userId) },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });
  }

  async updateUserRole(userId: number, role: string): Promise<void> {
    const validRoles = ["ADMIN", "CUSTOMER", "INVENTORYMANAGER"];
    if (!validRoles.includes(role)) throw new AppError("Invalid role.", 400);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError("User not found.", 404);

    await prisma.user.update({
      where: { id: userId },
      data: { role: role as Role },
    });

    await EmailServiceClient.sendRoleUpdateEmail(user.email, user.name, role);
  }

  async deactivateUser(userId: number): Promise<void> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError("User not found.", 404);
    if (!user.isActive) throw new AppError("User is already deactivated.", 400);

    await prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    });

    await EmailServiceClient.sendAccountDeactivationEmail(
      user.email,
      user.name
    );
  }

  async deleteAccount(userId: number): Promise<void> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError("User not found.", 404);

    await prisma.user.delete({ where: { id: userId } });

    await EmailServiceClient.sendAccountDeletionEmail(user.email, user.name);
  }

  async getUserById(userId: number): Promise<IUser | null> {
    return prisma.user.findUnique({ where: { id: userId } });
  }

  async updateUser(
    userId: number,
    userData: IUserUpdateData
  ): Promise<Partial<IUser>> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError("User not found.", 404);

    const normalizedData: Partial<IUserUpdateData> = { ...userData };

    if (typeof userData.dateOfBirth === "string") {
      normalizedData.dateOfBirth = new Date(userData.dateOfBirth);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: normalizedData,
    });

    return {
      name: updatedUser.name,
      email: updatedUser.email,
      phoneNumber: updatedUser.phoneNumber,
      dateOfBirth: updatedUser.dateOfBirth,
    };
  }
}

export default UserService.getInstance();
