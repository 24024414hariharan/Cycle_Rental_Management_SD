import prisma from "../clients/prisma";
import bcrypt from "bcryptjs";
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
  async register(userData: IUserRegistrationData): Promise<void> {
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const newUser = await prisma.user.create({
      data: { ...userData, password: hashedPassword },
    });

    const verificationToken = generateVerificationToken(newUser.id.toString());
    const verificationUrl = `${process.env.BASE_URL}/verify-email?token=${verificationToken}`;

    await EmailServiceClient.sendVerificationEmail(
      newUser.email,
      verificationUrl
    );
    console.log(`Verification Email Sent: ${verificationUrl}`);
  }

  async getUserByEmail(email: string): Promise<IUser | null> {
    return await prisma.user.findUnique({
      where: { email },
    });
  }

  // Compare plaintext password with hashed password
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
    const resetUrl = `${process.env.BASE_URL}/reset-password?token=${resetToken}`;

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpires: new Date(Date.now() + 3600 * 1000),
      },
    });

    await EmailServiceClient.sendPasswordResetEmail(user.email, resetUrl);

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

    await EmailServiceClient.sendAccountDeactivationEmail(user.email);
  }

  async deleteAccount(userId: number): Promise<void> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError("User not found.", 404);

    await prisma.user.delete({ where: { id: userId } });

    await EmailServiceClient.sendAccountDeletionEmail(user.email);
  }

  async getUserById(userId: number): Promise<IUser | null> {
    return prisma.user.findUnique({ where: { id: userId } });
  }

  async updateUser(userId: number, userData: IUserUpdateData): Promise<IUser> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError("User not found.", 404);

    return prisma.user.update({ where: { id: userId }, data: userData });
  }

  generateSessionToken(userId: string, role: string): string {
    return generateSessionToken(userId, role);
  }
}

export default new UserService();
