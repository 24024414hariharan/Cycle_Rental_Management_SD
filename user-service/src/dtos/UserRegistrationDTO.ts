import { Role } from "@prisma/client";

export interface IUserRegistrationData {
  email: string;
  password: string;
  name: string;
  dateOfBirth: Date | null;
  phoneNumber: string;
  identification: string;
  role?: Role;
}

export interface IUser extends IUserRegistrationData {
  id: number;
  isVerified: boolean;
  role: Role;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  passwordResetToken?: string | null;
  passwordResetExpires?: Date | null;
}

export interface IUserUpdateData {
  name?: string;
  dateOfBirth?: Date | string;
  phoneNumber?: string;
  email?: string;
  identification?: string;
}

export interface IUpdateUserRoleData {
  userId: number;
  role: string;
}

export interface IPasswordResetData {
  token: string;
  newPassword: string;
}

export interface IDeactivateUserData {
  userId: number;
}

export interface ICloseAccountData {
  confirmation: string;
}

export interface FareRequestDTO {
  cycleId: number;
  rentalHours: number;
}

export interface PaymentRequestDTO {
  userId: number;
  paymentMethod: string;
  amount: number;
  cookies: string;
  type: string;
  rentalId: number;
}
