import mongoose from "mongoose";

const { Schema } = mongoose;

const paymentSchema = new Schema(
    {
        bookingId: {
            type: Schema.Types.ObjectId,
            ref: "Booking",
            required: true
        },

        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        amount: {
            type: Number,
            required: true,
            min: 0
        },

        paymentMethod: {
            type: String,
            enum: [
                "UPI",
                "Card",
                "Net Banking",
                "Wallet"
            ],
            required: true
        },

        gateway: {
            type: String,
            enum: ["Razorpay"],
            default: "Razorpay"
        },

        razorpayOrderId: {
            type: String,
            default: null
        },

        transactionId: {
            type: String,
            default: null
        },

        paymentStatus: {
            type: String,
            enum: [
                "Pending",
                "Paid",
                "Failed",
                "Refunded"
            ],
            default: "Pending"
        },

        paymentDate: {
            type: Date,
            default: null
        },

        status: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model("Payment", paymentSchema);