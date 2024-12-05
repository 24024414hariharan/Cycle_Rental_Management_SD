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
  getAvailableCycles,
  calculateFare,
  payForRental,
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

router.post("/register", registerValidator, asyncHandler(register));
router.post("/login", loginLimiter, loginValidator, asyncHandler(login));
router.post("/logout", validateToken, asyncHandler(logout));

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

router.post("/request-password-reset", asyncHandler(requestPasswordReset));
router.post(
  "/reset-password",
  resetPasswordValidator,
  asyncHandler(resetPassword)
);

router.get("/profile", validateToken, asyncHandler(getProfile));
router.put("/profile", validateToken, asyncHandler(updateProfile));

router.put(
  "/role",
  validateToken,
  authorizeRoles(["ADMIN"]),
  updateRoleValidator,
  asyncHandler(updateRole)
);

router.get("/verify-email", asyncHandler(verifyEmail));

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

router.get(
  "/get-available-cycles",
  validateToken,
  asyncHandler(getAvailableCycles)
);

router.post("/calculate-fare", validateToken, asyncHandler(calculateFare));

router.post("/pay-rental", validateToken, asyncHandler(payForRental));

export default router;
