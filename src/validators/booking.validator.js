import { body, validationResult } from "express-validator";

export const bookingValidator = [
    body("classId")
        .notEmpty()
        .withMessage("Class ID is required")
        .isMongoId()
        .withMessage("Invalid class ID"),

    (req, res, next) => {
        const errors = validationResult(req);

        if(!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        next();
    }
];