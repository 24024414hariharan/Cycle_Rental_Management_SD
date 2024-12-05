import bcrypt from "bcryptjs";
import prisma from "../../src/clients/prisma";
import { UserFactoryProvider } from "../../src/factories/userFactory";

jest.mock("../../src/clients/prisma", () => ({
  user: {
    create: jest.fn(),
  },
}));

jest.mock("bcryptjs", () => ({
  hash: jest.fn(),
}));

describe("UserFactory", () => {
  const mockUserData = {
    email: "testuser@example.com",
    password: "SecurePass123!",
    name: "Test User",
    dateOfBirth: new Date("1990-01-01"),
    phoneNumber: "1234567890",
    identification: "ID12345",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (bcrypt.hash as jest.Mock).mockResolvedValue("hashedPassword");
  });

  it("should create a new ADMIN user", async () => {
    const factory = UserFactoryProvider.getFactory("ADMIN");
    (prisma.user.create as jest.Mock).mockResolvedValue({
      ...mockUserData,
      id: 1,
      password: "hashedPassword",
      role: "ADMIN",
    });

    const result = await factory.createUser({ ...mockUserData, role: "ADMIN" });

    expect(bcrypt.hash).toHaveBeenCalledWith(mockUserData.password, 10);
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        email: mockUserData.email,
        password: "hashedPassword",
        role: "ADMIN",
      }),
    });
    expect(result).toEqual(
      expect.objectContaining({
        email: mockUserData.email,
        password: "hashedPassword",
        role: "ADMIN",
      })
    );
  });

  it("should create a new INVENTORYMANAGER user", async () => {
    const factory = UserFactoryProvider.getFactory("INVENTORYMANAGER");
    (prisma.user.create as jest.Mock).mockResolvedValue({
      ...mockUserData,
      id: 1,
      password: "hashedPassword",
      role: "INVENTORYMANAGER",
    });

    const result = await factory.createUser({
      ...mockUserData,
      role: "INVENTORYMANAGER",
    });

    expect(bcrypt.hash).toHaveBeenCalledWith(mockUserData.password, 10);
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        email: mockUserData.email,
        password: "hashedPassword",
        role: "INVENTORYMANAGER",
      }),
    });
    expect(result).toEqual(
      expect.objectContaining({
        email: mockUserData.email,
        password: "hashedPassword",
        role: "INVENTORYMANAGER",
      })
    );
  });

  it("should create a new CUSTOMER user", async () => {
    const factory = UserFactoryProvider.getFactory("CUSTOMER");
    (prisma.user.create as jest.Mock).mockResolvedValue({
      ...mockUserData,
      id: 1,
      password: "hashedPassword",
      role: "CUSTOMER",
    });

    const result = await factory.createUser({ ...mockUserData, role: "CUSTOMER" });

    expect(bcrypt.hash).toHaveBeenCalledWith(mockUserData.password, 10);
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        email: mockUserData.email,
        password: "hashedPassword",
        role: "CUSTOMER",
      }),
    });
    expect(result).toEqual(
      expect.objectContaining({
        email: mockUserData.email,
        password: "hashedPassword",
        role: "CUSTOMER",
      })
    );
  });

  it("should throw an error for unsupported roles", () => {
    expect(() => UserFactoryProvider.getFactory("UNKNOWN" as any)).toThrow(
      "Unsupported role: UNKNOWN"
    );
  });
});
