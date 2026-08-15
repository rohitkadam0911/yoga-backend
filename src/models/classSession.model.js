import mongoose from "mongoose";

const classSessionSchema = new mongoose.Schema(
    {
        classId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Class",
            required: true
        },

        instructorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Instructor",
            required: true
        },

        date: {
            type: Date,
            required: true
        },

        startTime: {
            type: String,
            required: true
        },

        endTime: {
            type: String,
            required: true
        },

        capacity: {
            type: Number,
            required: true,
            min: 1
        },

        bookedSeats: {
            type: Number,
            default: 0,
            min: 0
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

export default mongoose.model("ClassSession", classSessionSchema);