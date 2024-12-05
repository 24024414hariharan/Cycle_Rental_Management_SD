import prisma from "../../src/clients/prisma";
import { mocked } from "jest-mock";

jest.mock("@prisma/client", () => {
  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };
  return {
    PrismaClient: jest.fn(() => mockPrisma),
  };
});

describe("Prisma Client", () => {
  const mockPrisma = mocked(prisma);

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should call user.findUnique with the correct arguments", async () => {
    const mockUser = {
      id: 1,
      email: "test@example.com",
      password: "hashed_password",
      name: "Test User",
      dateOfBirth: null,
      phoneNumber: "1234567890",
      identification: "ID123",
      isVerified: true,
      role: "USER",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      passwordResetToken: null,
      passwordResetExpires: null,
    } as any;
    mockPrisma.user.findUnique.mockResolvedValue(mockUser);

    const user = await prisma.user.findUnique({
      where: { id: 1 },
    });

    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
    });
    expect(user).toEqual(mockUser);
  });

  it("should call user.create with the correct arguments", async () => {
    const mockUser = {
      id: 1,
      email: "test@example.com",
      password: "hashed_password",
      name: "Test User",
      dateOfBirth: null,
      phoneNumber: "1234567890",
      identification: "ID123",
      isVerified: true,
      role: "USER",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      passwordResetToken: null,
      passwordResetExpires: null,
    } as any;
    mockPrisma.user.create.mockResolvedValue(mockUser);

    const user = await prisma.user.create({
      data: {
        email: "test@example.com",
        password: "hashed_password",
        name: "Test User",
        dateOfBirth: null,
        phoneNumber: "1234567890",
        identification: "ID123",
        isVerified: true,
        role: "USER",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    } as any);

    expect(mockPrisma.user.create).toHaveBeenCalledWith({
      data: {
        email: "test@example.com",
        password: "hashed_password",
        name: "Test User",
        dateOfBirth: null,
        phoneNumber: "1234567890",
        identification: "ID123",
        isVerified: true,
        role: "USER",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    } as any);
    expect(user).toEqual(mockUser);
  });
});
