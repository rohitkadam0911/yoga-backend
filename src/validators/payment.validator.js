import { body, validationResult } from "express-validator";

export const paymentValidator = [
    body("bookingId")  
        .trim()
        .notEmpty()
        .withMessage("Booking ID is required")
        .isMongoId()
        .withMessage("Invalid Booking ID"),

    body("paymentMethod")
        .trim()
        .notEmpty()
        .withMessage("Payment method is required")
        .isIn([
            "UPI",
            "Card",
            "Net Banking",
            "Wallet"
        ])
        .withMessage("Invalid payment method"),

    (req, res, next) => {
        const errors = validationResult(req);

        if(!errors.isEmpty()){
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        next();
    }
];