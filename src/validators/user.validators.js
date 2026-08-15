import { body } from "express-validator";
import { validateRequest } from "../middleware/validation.middleware.js";

export const signupValidator = [

    body("name")
        .trim()
        .notEmpty()
        .withMessage("Name is required"),

    body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Invalid Email"),

    body("password")
        .trim()
        .notEmpty()
        .withMessage("Password is required")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters"),

    body("phone")
        .optional()
        .isMobilePhone("en-IN")
        .withMessage("Invalid Phone Number"),

    validateRequest
];

// Login
export const loginValidator = [

    body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Invalid Email"),

    body("password")
        .trim()
        .notEmpty()
        .withMessage("Password is required"),

    validateRequest
];

// Send OTP
export const sendOtpValidator = [

    body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Invalid Email"),

    validateRequest
];

// Verify OTP
export const verifyOtpValidator = [

    body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Invalid Email"),

    body("otp")
        .trim()
        .notEmpty()
        .withMessage("OTP is required")
        .isLength({ min: 6, max: 6 })
        .withMessage("OTP must be 6 digits"),

    validateRequest
];

// Reset Password
export const resetPasswordValidator = [

    body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Invalid Email"),

    body("password")
        .trim()
        .notEmpty()
        .withMessage("Password is required")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters"),

    body("confirmPassword")
        .trim()
        .notEmpty()
        .withMessage("Confirm Password is required"),

    validateRequest
];

// Change Password
export const changePasswordValidator = [

    body("oldPassword")
        .trim()
        .notEmpty()
        .withMessage("Old Password is required"),

    body("newPassword")
        .trim()
        .notEmpty()
        .withMessage("New Password is required")
        .isLength({ min: 6 })
        .withMessage("New Password must be at least 6 characters"),

    body("confirmPassword")
        .trim()
        .notEmpty()
        .withMessage("Confirm Password is required"),

    validateRequest
];

// Update Profile
export const updateProfileValidator = [

    body("name")
        .trim()
        .notEmpty()
        .withMessage("Name is required"),

    body("phone")
        .optional()
        .isMobilePhone("en-IN")
        .withMessage("Invalid Phone Number"),

    validateRequest
];