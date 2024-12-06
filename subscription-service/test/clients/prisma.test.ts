import prisma from "../../src/clients/prisma";

describe("Prisma Subscription Model", () => {
  afterAll(async () => {
    await prisma.$disconnect(); // Disconnect Prisma after all tests
  });

  beforeEach(async () => {
    // Clear the Subscription table before each test
    await prisma.subscription.deleteMany({});
  });

  it("should create a subscription", async () => {
    const subscription = await prisma.subscription.create({
      data: {
        userId: 1,
        isActive: true,
        plan: "Basic",
        status: "Active",
        paymentMethod: "Credit Card",
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      },
    });

    expect(subscription).toHaveProperty("id");
    expect(subscription.userId).toBe(1);
    expect(subscription.isActive).toBe(true);
    expect(subscription.plan).toBe("Basic");
    expect(subscription.status).toBe("Active");
    expect(subscription.paymentMethod).toBe("Credit Card");
  });

  it("should retrieve a subscription by userId", async () => {
    // Insert a subscription
    await prisma.subscription.create({
      data: {
        userId: 1,
        isActive: true,
        plan: "Basic",
        status: "Active",
        paymentMethod: "Credit Card",
      },
    });

    // Retrieve the subscription
    const subscription = await prisma.subscription.findUnique({
      where: { userId: 1 },
    });

    expect(subscription).not.toBeNull();
    expect(subscription?.userId).toBe(1);
    expect(subscription?.plan).toBe("Basic");
  });

  it("should update a subscription", async () => {
    // Insert a subscription
    const subscription = await prisma.subscription.create({
      data: {
        userId: 1,
        isActive: true,
        plan: "Basic",
        status: "Active",
        paymentMethod: "Credit Card",
      },
    });

    // Update the subscription
    const updatedSubscription = await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        plan: "Premium",
        isActive: false,
      },
    });

    expect(updatedSubscription.plan).toBe("Premium");
    expect(updatedSubscription.isActive).toBe(false);
  });

  it("should delete a subscription", async () => {
    // Insert a subscription
    const subscription = await prisma.subscription.create({
      data: {
        userId: 1,
        isActive: true,
        plan: "Basic",
        status: "Active",
      },
    });

    // Delete the subscription
    await prisma.subscription.delete({
      where: { id: subscription.id },
    });

    const deletedSubscription = await prisma.subscription.findUnique({
      where: { id: subscription.id },
    });

    expect(deletedSubscription).toBeNull();
  });

  it("should handle unique constraint violations", async () => {
    // Insert a subscription
    await prisma.subscription.create({
      data: {
        userId: 1,
        isActive: true,
        plan: "Basic",
        status: "Active",
      },
    });

    // Try inserting another subscription with the same userId
    await expect(
      prisma.subscription.create({
        data: {
          userId: 1,
          isActive: false,
          plan: "None",
          status: "Inactive",
        },
      })
    ).rejects.toThrowError(/Unique constraint failed/);
  });
});
