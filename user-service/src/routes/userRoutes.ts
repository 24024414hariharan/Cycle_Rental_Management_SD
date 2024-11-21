import { Router } from "express";
import {
  register,
  login,
  logout,
  verifyEmail,
  requestPasswordReset,
  resetPassword,
  getProfile,
  updateProfile,
  deactivateAccount,
  closeAccount,
  updateRole,
  getSubscriptionStatus,
  updateSubscription,
} from "../controllers/userController";

import { asyncHandler } from "../utils/asyncHandler";
import {
  registerValidator,
  loginValidator,
  resetPasswordValidator,
  deactivateAccountValidator,
  closeAccountValidator,
  updateRoleValidator,
} from "../validators/userValidators";
import { loginLimiter } from "../middleware/rateLimiter";
import { validateToken, authorizeRoles } from "../middleware/authMiddleware";

const router = Router();

// Registration and login
router.post("/register", registerValidator, asyncHandler(register));
router.post("/login", loginLimiter, loginValidator, asyncHandler(login));
router.post("/logout", validateToken, asyncHandler(logout));

// Account management
router.put(
  "/deactivate",
  validateToken,
  authorizeRoles(["ADMIN"]),
  deactivateAccountValidator,
  asyncHandler(deactivateAccount)
);
router.delete(
  "/close-account",
  validateToken,
  closeAccountValidator,
  asyncHandler(closeAccount)
);

// Password reset
router.post("/request-password-reset", asyncHandler(requestPasswordReset));
router.post(
  "/reset-password",
  resetPasswordValidator,
  asyncHandler(resetPassword)
);

// Profile
router.get("/profile", validateToken, asyncHandler(getProfile));
router.put("/profile", validateToken, asyncHandler(updateProfile));

// Role management (Admin only)
router.put(
  "/role",
  validateToken,
  authorizeRoles(["ADMIN"]),
  updateRoleValidator,
  asyncHandler(updateRole)
);

// Email verification
router.get("/verify-email", asyncHandler(verifyEmail));

//Subscription
router.get(
  "/subscription/status",
  validateToken,
  asyncHandler(getSubscriptionStatus)
);

router.put(
  "/subscription/update",
  validateToken,
  asyncHandler(updateSubscription)
);

export default router;
