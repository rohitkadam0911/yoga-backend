import mongoose from "mongoose";
import { createHmac } from "node:crypto";
import Payment from "../models/payment.model.js";
import Booking from "../models/booking.model.js";
import razorpay from "../config/razorpay.js";

export const createPayment = async (req, res) => {
    try {
        const userId = req.user.id;

        const {
            bookingId,
            paymentMethod
        } = req.body;

        if (!mongoose.Types.ObjectId.isValid(bookingId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Booking ID"
            });
        }

        const booking = await Booking.findOne({
            _id: bookingId,
            userId,
            status: true
        }).populate(
            "userId",
            "name email phone"
        );

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found"
            });
        }

        if (booking.bookingStatus === "Cancelled") {
            return res.status(400).json({
                success: false,
                message: "Cancelled booking cannot be paid"
            });
        }

        if (booking.paymentStatus === "Paid") {
            return res.status(400).json({
                success: false,
                message: "Booking is already paid"
            });
        }

        const allowedPaymentMethods = [
            "UPI",
            "Card",
            "Net Banking",
            "Wallet"
        ];

        if (!allowedPaymentMethods.includes(paymentMethod)) {
            return res.status(400).json({
                success: false,
                message: "Invalid payment method"
            });
        }

        const amount = Number(booking.totalAmount);

        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid booking amount"
            });
        }

        const amountInPaise = Math.round(amount * 100);

        const razorpayOrder = await razorpay.orders.create({
            amount: amountInPaise,
            currency: "INR",
            receipt: `booking_${booking._id}`,
            notes: {
                bookingId: booking._id.toString(),
                userId: userId.toString()
            }
        });

        const payment = await Payment.create({
            bookingId: booking._id,
            userId,
            amount,
            paymentMethod,
            gateway: "Razorpay",
            razorpayOrderId: razorpayOrder.id,
            transactionId: null,
            paymentStatus: "Pending",
            paymentDate: null,
            status: true
        });

        return res.status(200).json({
            success: true,
            message: "Payment initiated successfully",
            data: {
                paymentId: payment._id,
                razorpayOrderId: razorpayOrder.id,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency,
                key: process.env.RAZORPAY_KEY_ID,
                name: "YogaConnect",
                description: `Yoga Class Booking - ${booking._id}`,
                prefill: {
                    name: booking.userId?.name || "",
                    email: booking.userId?.email || "",
                    contact: booking.userId?.phone || ""
                }
            }
        });

    } catch (error) {
        console.error("Create Payment Error:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const paymentSuccess = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body;

        if (
            !razorpay_order_id ||
            !razorpay_payment_id ||
            !razorpay_signature
        ) {
            return res.status(400).json({
                success: false,
                message: "Payment verification data is missing"
            });
        }

        const payment = await Payment.findOne({
            razorpayOrderId: razorpay_order_id,
            status: true
        });

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: "Payment not found"
            });
        }

        const generatedSignature = createHmac(
            "sha256",
            process.env.RAZORPAY_KEY_SECRET
        )
            .update(
                `${payment.razorpayOrderId}|${razorpay_payment_id}`
            )
            .digest("hex");

        if (generatedSignature !== razorpay_signature) {
            payment.paymentStatus = "Failed";
            payment.paymentDate = new Date();

            await payment.save();

            await Booking.findByIdAndUpdate(
                payment.bookingId,
                {
                    paymentStatus: "Failed"
                }
            );

            return res.status(400).json({
                success: false,
                message: "Invalid payment signature"
            });
        }

        if (payment.paymentStatus === "Paid") {
            return res.status(200).json({
                success: true,
                message: "Payment already verified",
                data: payment
            });
        }

        payment.transactionId = razorpay_payment_id;
        payment.paymentStatus = "Paid";
        payment.paymentDate = new Date();

        await payment.save();

        await Booking.findByIdAndUpdate(
            payment.bookingId,
            {
                paymentStatus: "Paid"
            }
        );

        return res.status(200).json({
            success: true,
            message: "Payment verified successfully",
            data: {
                paymentId: payment._id,
                razorpayOrderId: razorpay_order_id,
                razorpayPaymentId: razorpay_payment_id,
                paymentStatus: "Paid"
            }
        });

    } catch (error) {
        console.error("Payment Success Error:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const paymentFailure = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id
        } = req.body;

        if (!razorpay_order_id) {
            return res.status(400).json({
                success: false,
                message: "Razorpay Order ID is required"
            });
        }

        const payment = await Payment.findOne({
            razorpayOrderId: razorpay_order_id,
            status: true
        });

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: "Payment not found"
            });
        }

        payment.paymentStatus = "Failed";
        payment.transactionId = razorpay_payment_id || null;
        payment.paymentDate = new Date();

        await payment.save();

        await Booking.findByIdAndUpdate(
            payment.bookingId,
            {
                paymentStatus: "Failed"
            }
        );

        return res.status(200).json({
            success: true,
            message: "Payment failed",
            data: {
                paymentId: payment._id,
                razorpayOrderId: razorpay_order_id,
                razorpayPaymentId: razorpay_payment_id || null,
                paymentStatus: "Failed"
            }
        });

    } catch (error) {
        console.error("Payment Failure Error:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getMyPayments = async (req, res) => {
    try {
        const payments = await Payment.find({
            userId: req.user.id,
            status: true
        })
            .populate({
                path: "bookingId",
                populate: {
                    path: "classId",
                    select: "title thumbnail category scheduleDate"
                }
            })
            .sort({
                createdAt: -1
            });

        return res.status(200).json({
            success: true,
            count: payments.length,
            data: payments
        });

    } catch (error) {
        console.error("Get My Payments Error:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getPaymentById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Payment ID"
            });
        }

        const payment = await Payment.findById(id)
            .populate(
                "userId",
                "name email phone"
            )
            .populate({
                path: "bookingId",
                populate: {
                    path: "classId",
                    select: "title thumbnail category scheduleDate"
                }
            });

        if (!payment || !payment.status) {
            return res.status(404).json({
                success: false,
                message: "Payment not found"
            });
        }

        if (
            req.user.role === "user" &&
            payment.userId._id.toString() !==
            req.user.id.toString()
        ) {
            return res.status(403).json({
                success: false,
                message: "Access denied"
            });
        }

        return res.status(200).json({
            success: true,
            data: payment
        });

    } catch (error) {
        console.error("Get Payment By ID Error:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getAllPayments = async (req, res) => {
    try {
        const payments = await Payment.find({
            status: true
        })
            .populate(
                "userId",
                "name email phone"
            )
            .populate({
                path: "bookingId",
                populate: {
                    path: "classId",
                    select: "title thumbnail category scheduleDate"
                }
            })
            .sort({
                createdAt: -1
            });

        return res.status(200).json({
            success: true,
            count: payments.length,
            data: payments
        });

    } catch (error) {
        console.error("Get All Payments Error:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};