import { body, validationResult } from "express-validator";

export const classValidator = [

    body("title")
        .trim()
        .notEmpty()
        .withMessage("Title is required"),

    body("description")
        .trim()
        .notEmpty()
        .withMessage("Description is required"),

    body("category")
        .notEmpty()
        .withMessage("Category is required")
        .isIn([
            "Hatha Yoga",
            "Power Yoga",
            "Meditation",
            "Kids Yoga",
            "Prenatal Yoga",
            "Pranayama"
        ])
        .withMessage("Invalid category"),

    body("level")
        .optional()
        .isIn([
            "Beginner",
            "Intermediate",
            "Advanced"
        ])
        .withMessage("Invalid level"),

    body("duration")
        .notEmpty()
        .withMessage("Duration is required")
        .isNumeric()
        .withMessage("Duration must be a number")
        .custom((value) => value > 0)
        .withMessage("Duration must be greater than 0"),

    body("price")
        .notEmpty()
        .withMessage("Price is required")
        .isNumeric()
        .withMessage("Price must be a number")
        .custom((value) => value >= 0)
        .withMessage("Price cannot be negative"),

    body("capacity")
        .notEmpty()
        .withMessage("Capacity is required")
        .isInt({ min: 1 })
        .withMessage("Capacity must be at least 1"),

    body("mode")
        .optional()
        .isIn(["Online", "Offline"])
        .withMessage("Mode must be Online or Offline"),

    body("scheduleDate")
        .notEmpty()
        .withMessage("Schedule date is required")
        .isISO8601()
        .withMessage("Invalid schedule date"),

    body("startTime")
        .notEmpty()
        .withMessage("Start Time is required"),

    body("endTime")
        .notEmpty()
        .withMessage("End Time is required"),


    (req, res, next) => {

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        next();
    }
];