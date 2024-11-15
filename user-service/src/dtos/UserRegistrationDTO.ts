export interface IUserRegistrationData {
  email: string;
  password: string;
  name: string;
  dateOfBirth: Date;
  phoneNumber: string;
  identification: string;
  isVerified: boolean;
}

export interface IUser extends IUserRegistrationData {
  id: number;
  role: string;
}
