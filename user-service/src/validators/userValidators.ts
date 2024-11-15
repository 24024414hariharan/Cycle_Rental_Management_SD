// src/validators/userValidators.ts
import { body } from "express-validator";

// Validation for user registration
export const registerValidator = [
  body("email").isEmail().withMessage("Must be a valid email"),

  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/[A-Z]/)
    .withMessage("Password must contain an uppercase letter")
    .matches(/[a-z]/)
    .withMessage("Password must contain a lowercase letter")
    .matches(/[0-9]/)
    .withMessage("Password must contain a number")
    .matches(/[@$!%*?&#]/)
    .withMessage("Password must contain a special character"),

  body("name").notEmpty().withMessage("Name is required"),

  body("dateOfBirth")
    .isISO8601()
    .withMessage("Invalid date format, please use YYYY-MM-DD")
    .toDate(),

  body("phoneNumber").isMobilePhone("any").withMessage("Invalid phone number"),

  body("identification").notEmpty().withMessage("Identification is required"),
];

export const loginValidator = [
  body("email").isEmail().withMessage("Must be a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
];
