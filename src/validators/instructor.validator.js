import { body, validationResult } from "express-validator";


export const instructorValidator = [
    body("bio")
    .trim()
    .notEmpty()
    .withMessage("Bio is required"),

    body("qualification")
    .trim()
    .notEmpty()
    .withMessage("Qualification is required"),

    body("experience")
    .isInt({ min: 0 })
    .withMessage("Experience must be a positive number"),

    body("expertise")
    .isArray({ min: 1 })
    .withMessage("At least one expertise is required"),

    body("languages")
    .isArray({ min: 1 })
    .withMessage("At least one language is required"),

    body("fees")
    .isFloat({ min: 0})
    .withMessage("Fees must be a valid number"),

    (req, res, next) => {
        const errors = validationResult(req);

        if(!errors.isEmpty()){
            return res.status(400).json({
                success: false,
                errors: errors.array(),
            });
        }
        next();
    }
];