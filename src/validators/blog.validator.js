import { body, validationResult } from "express-validator";

export const blogValidator = [
    body("title")
        .trim()
        .notEmpty()
        .withMessage("Title is required"),
    
    body("description")
        .trim()
        .notEmpty()
        .withMessage("Description is required"),
    
    body("content")
        .trim()
        .notEmpty()
        .withMessage("Content is required"),

    body("category")
        .notEmpty()
        .withMessage("Category is required")
        .isIn([
            "Yoga",
            "Meditation",
            "Fitness",
            "Health",
            "Lifestyle"
        ])
        .withMessage("Invalid category"),


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