import express from "express";
import { auth } from "../middleware/auth.middleware.js";
import { isAdmin, isUser, isInstructor } from "../middleware/role.middleware.js";
import { paymentValidator } from "../validators/payment.validator.js";
import {
    createPayment, paymentSuccess, paymentFailure, getMyPayments, getPaymentById, getAllPayments, getInstructorPayments, getInstructorEarnings, getInstructorMonthlyEarnings 
} from "../controllers/payment.controller.js";

const router = express.Router();

router.post( "/create", auth, isUser, paymentValidator, createPayment );

router.post( "/success", paymentSuccess );

router.post( "/failure", paymentFailure );

router.get( "/my-payments", auth, isUser, getMyPayments );

router.get("/instructor", auth, isInstructor, getInstructorPayments);

router.get("/instructor/earnings", auth, isInstructor, getInstructorEarnings);

router.get("/instructor/monthly-earnings", auth, isInstructor, getInstructorMonthlyEarnings);

router.get( "/:id", auth, getPaymentById );

router.get( "/", auth, isAdmin, getAllPayments );

export default router;