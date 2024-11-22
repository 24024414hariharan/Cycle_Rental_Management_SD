export interface IUserRegistrationData {
  email: string; // Required for registration and authentication
  password: string; // Required for registration and authentication
  name: string; // User's name
  dateOfBirth: Date; // User's date of birth
  phoneNumber: string; // Required for contact or multi-factor authentication
  identification: string; // Unique identification (e.g., national ID, passport)
}

export interface IUser extends IUserRegistrationData {
  id: number;
  isVerified: boolean;
  role: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  passwordResetToken?: string | null; // Allow null values
  passwordResetExpires?: Date | null; // Allow null values
}

export interface IUserUpdateData {
  name?: string; // Optional for profile updates
  dateOfBirth?: Date | string; // Optional for profile updates
  phoneNumber?: string; // Optional for profile updates
  email?: string;
  identification?: string; // Optional for profile updates
}

export interface IUpdateUserRoleData {
  userId: number; // User's ID
  role: string; // Role to be assigned (e.g., ADMIN, CUSTOMER)
}

export interface IPasswordResetData {
  token: string; // Token for verifying password reset request
  newPassword: string; // New password to be set
}

export interface IDeactivateUserData {
  userId: number; // User's ID to deactivate
}

export interface ICloseAccountData {
  confirmation: string; // "CLOSE" confirmation string for account deletion
}
