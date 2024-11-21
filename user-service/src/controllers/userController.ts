import { Request, Response, NextFunction } from "express";
import userService from "../services/userService";
import { validationResult } from "express-validator";
import { AppError } from "../middleware/errorHandler";
import { generateSessionToken } from "../utils/tokenUtil";
import subscriptionServiceClient from "../clients/SubscriptionServiceClient";

// Register user
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError("Validation failed.", 400));
  }

  try {
    await userService.register(req.body);
    res.status(201).json({
      message:
        "User registered successfully. Please check your email for verification.",
    });
  } catch (error) {
    next(error);
  }
};

// Login user
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = req.body;

  try {
    // Fetch the user by email
    const user = await userService.getUserByEmail(email);
    if (!user) {
      return next(new AppError("Invalid credentials.", 400));
    }

    // Compare passwords
    const isPasswordValid = await userService.comparePasswords(
      password,
      user.password
    );
    if (!isPasswordValid) {
      return next(new AppError("Invalid credentials.", 400));
    }

    // Check if email is verified
    if (!user.isVerified) {
      return next(new AppError("Email not verified.", 403));
    }

    // Generate session token
    const token = generateSessionToken(user.id.toString(), user.role);
    res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      })
      .json({ message: "Login successful" });
  } catch (error) {
    next(error);
  }
};

// Logout user
export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      throw new AppError("User is not authenticated.", 401);
    }

    // Log the logout event (optional)
    console.log(`User ID ${userId} logged out at ${new Date().toISOString()}`);

    // Clear the authentication cookie
    res.clearCookie("token").json({ message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
};

// Verify email
export const verifyEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { token } = req.query;

  try {
    await userService.verifyEmailToken(token as string);
    res.json({ message: "Email verified successfully." });
  } catch (error) {
    next(error);
  }
};

// Request password reset
export const requestPasswordReset = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email } = req.body;

  try {
    await userService.sendPasswordResetEmail(email);
    res.json({ message: "Password reset link sent to your email." });
  } catch (error) {
    next(error);
  }
};

// Reset password
export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { token, newPassword } = req.body;

  try {
    await userService.resetPassword(token, newPassword);
    res.json({ message: "Password updated successfully." });
  } catch (error) {
    next(error);
  }
};

// Update role (Admin only)
export const updateRole = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId, role } = req.body;

  try {
    await userService.updateUserRole(userId, role);
    res.json({ message: "User role updated successfully." });
  } catch (error) {
    next(error);
  }
};

// Deactivate account
export const deactivateAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req.body;

  try {
    await userService.deactivateUser(userId);
    res.json({ message: "User account deactivated successfully." });
  } catch (error) {
    next(error);
  }
};

// Close account
export const closeAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { confirmation } = req.body;

  if (confirmation !== "CLOSE") {
    return next(
      new AppError("Invalid confirmation. Type 'CLOSE' to confirm.", 400)
    );
  }

  try {
    await userService.deleteAccount(req.user?.userId!);
    res.json({
      message: "Account closed successfully. We're sad to see you go!",
    });
  } catch (error) {
    next(error);
  }
};

// Get user profile
export const getProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const profile = await userService.getUserById(req.user?.userId!);
    res.json(profile);
  } catch (error) {
    next(error);
  }
};

// Update user profile
export const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const updatedUser = await userService.updateUser(
      req.user?.userId!,
      req.body
    );
    res.json(updatedUser);
  } catch (error) {
    next(error);
  }
};

export const getSubscriptionStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      throw new AppError("Unauthorized: User information missing.", 401);
    }

    const subscriptionStatus =
      await subscriptionServiceClient.getSubscriptionStatus(userId);
    res.status(200).json({
      status: "success",
      message: "Subscription status retrieved successfully.",
      data: subscriptionStatus,
    });
  } catch (error) {
    next(error);
  }
};

// Update user's subscription
export const updateSubscription = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      throw new AppError("Unauthorized: User information missing.", 401);
    }

    const { isActive, plan, paymentMethod } = req.body;

    const updatedSubscription =
      await subscriptionServiceClient.updateSubscription(
        userId,
        isActive,
        plan,
        paymentMethod
      );

    res.status(200).json({
      status: "success",
      message: "Subscription updated successfully.",
      data: updatedSubscription,
    });
  } catch (error) {
    next(error);
  }
};
