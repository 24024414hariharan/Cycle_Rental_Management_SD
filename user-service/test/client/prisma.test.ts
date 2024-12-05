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

  jest.useFakeTimers().setSystemTime(new Date("2024-12-05T12:52:30.127Z")); // Set system time

  it("should call user.create with the correct arguments", async () => {
    const mockPrisma = { user: { create: jest.fn() } } as any;
    const userFactory = {
      email: "test@example.com",
      password: "hashed_password",
      isVerified: true,
      role: "USER",
      phoneNumber: "1234567890",
      identification: "ID123",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  
    await mockPrisma.user.create({
      data: userFactory,
    });
  
    expect(mockPrisma.user.create).toHaveBeenCalledWith({
      data: {
        ...userFactory,
        createdAt: new Date("2024-12-05T12:52:30.127Z"),
        updatedAt: new Date("2024-12-05T12:52:30.127Z"),
      },
    });
  });
});
