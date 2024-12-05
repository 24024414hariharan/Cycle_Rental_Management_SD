import { body } from "express-validator";

export const registerValidator = [
  body("email").isEmail().withMessage("Must be a valid email").trim(),

  body("password")
    .isLength({ min: 8, max: 32 })
    .withMessage("Password must be 8-32 characters long")
    .matches(/[A-Z]/)
    .withMessage("Password must contain an uppercase letter")
    .matches(/[a-z]/)
    .withMessage("Password must contain a lowercase letter")
    .matches(/[0-9]/)
    .withMessage("Password must contain a number")
    .matches(/[@$!%*?&#]/)
    .withMessage("Password must contain a special character"),

  body("name").notEmpty().withMessage("Name is required").trim(),

  body("dateOfBirth")
    .isISO8601()
    .withMessage("Invalid date format, please use YYYY-MM-DD")
    .toDate()
    .custom((value) => {
      const age = new Date().getFullYear() - value.getFullYear();
      if (age < 18) {
        throw new Error("You must be at least 18 years old");
      }
      return true;
    }),

  body("phoneNumber")
    .isMobilePhone("any")
    .withMessage("Invalid phone number")
    .isLength({ min: 10, max: 15 })
    .withMessage("Phone number must be between 10-15 digits")
    .trim(),

  body("identification")
    .notEmpty()
    .withMessage("Identification is required")
    .trim(),

  body("role")
    .optional()
    .isIn(["ADMIN", "CUSTOMER", "INVENTORYMANAGER"])
    .withMessage("Invalid role provided"),
];

export const loginValidator = [
  body("email").isEmail().withMessage("Must be a valid email").trim(),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .bail() // Stop further validation if this fails
    .isLength({ min: 8, max: 32 })
    .withMessage("Password must be 8-32 characters long"),
];

export const resetPasswordValidator = [
  body("token").notEmpty().withMessage("Reset token is required"),

  body("newPassword")
    .isLength({ min: 8, max: 32 })
    .withMessage("Password must be 8-32 characters long")
    .matches(/[A-Z]/)
    .withMessage("Password must contain an uppercase letter")
    .matches(/[a-z]/)
    .withMessage("Password must contain a lowercase letter")
    .matches(/[0-9]/)
    .withMessage("Password must contain a number")
    .matches(/[@$!%*?&#]/)
    .withMessage("Password must contain a special character"),
];

export const deactivateAccountValidator = [
  body("userId").isInt({ gt: 0 }).withMessage("A valid user ID is required"),
];

export const closeAccountValidator = [
  body("confirmation")
    .equals("CLOSE")
    .withMessage("You must type 'CLOSE' to confirm account deletion"),
];

export const updateRoleValidator = [
  body("userId").isInt({ gt: 0 }).withMessage("A valid user ID is required"),

  body("role")
    .isIn(["ADMIN", "CUSTOMER", "INVENTORYMANAGER"])
    .withMessage("Invalid role provided"),
];

export default {
  registerValidator,
  loginValidator,
  resetPasswordValidator,
  deactivateAccountValidator,
  closeAccountValidator,
  updateRoleValidator,
};
