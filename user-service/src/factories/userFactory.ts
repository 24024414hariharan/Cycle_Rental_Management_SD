import { IUser } from "../dtos/UserRegistrationDTO";
import prisma from "../clients/prisma";
import bcrypt from "bcryptjs";

type UserRole = "ADMIN" | "INVENTORYMANAGER" | "CUSTOMER";

abstract class BaseUserFactory {
  abstract role: UserRole;

  async createUser(userData: any): Promise<IUser> {
    userData.password = await bcrypt.hash(userData.password, 10);
    const newData = await prisma.user.create({
      data: {
        ...userData,
      },
    });

    return newData;
  }
}

class AdminUserFactory extends BaseUserFactory {
  role: UserRole = "ADMIN";
}

class InventoryManagerUserFactory extends BaseUserFactory {
  role: UserRole = "INVENTORYMANAGER";
}

class CustomerUserFactory extends BaseUserFactory {
  role: UserRole = "CUSTOMER";
}

export class UserFactoryProvider {
  private static factories: Record<UserRole, BaseUserFactory> = {
    ADMIN: new AdminUserFactory(),
    INVENTORYMANAGER: new InventoryManagerUserFactory(),
    CUSTOMER: new CustomerUserFactory(),
  };

  static getFactory(role: UserRole): BaseUserFactory {
    const factory = this.factories[role];
    if (!factory) {
      throw new Error(`Unsupported role: ${role}`);
    }
    return factory;
  }
}
