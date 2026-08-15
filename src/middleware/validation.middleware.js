import { validationResult } from "express-validator";

export const validateRequest = (req, res, next) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {

        const formattedErrors = errors.array().map((error) => ({
            field: error.path,
            message: error.msg
        }));

        return res.status(400).json({
            success: false,
            message: "Validation Error",
            errors: formattedErrors
        });
    }

    next();
};