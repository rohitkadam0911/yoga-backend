import mongoose from "mongoose";

const Schema = mongoose.Schema;

const bookingSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        classId: {
            type: Schema.Types.ObjectId,
            ref: "Class",
            required: true
        },

        sessionId: {
            type: Schema.Types.ObjectId,
            ref: "ClassSession",
            required: true
        },

        instructorId: {
            type: Schema.Types.ObjectId,
            ref: "Instructor",
            required: true
        },

        totalAmount: {
            type: Number,
            required: true,
            min: 0
        },

        paymentStatus: {
            type: String,
            enum: [
                "Pending",
                "Paid",
                "Failed",
                "Refunded",
                "Cancelled"
            ],
            default: "Pending"
        },

        bookingStatus: {
            type: String,
            enum: [
                "Booked",
                "Cancelled",
                "Completed"
            ],
            default: "Booked"
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

export default mongoose.model("Booking", bookingSchema);