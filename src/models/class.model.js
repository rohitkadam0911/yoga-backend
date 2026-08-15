import mongoose from "mongoose";

const Schema = mongoose.Schema;

const classSchema = new Schema(
    {
        instructorId: {
            type: Schema.Types.ObjectId,
            ref: "Instructor",
            required: true
        },

        title: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            required: true,
            trim: true,
        },

        category: {
            type: String,
            enum: [
                "Hatha Yoga",
                "Power Yoga",
                "Meditation",
                "Kids Yoga",
                "Prenatal Yoga",
                "Pranayama"
            ],
            required: true
        },

        level: {
            type: String,
            enum: [
                "Beginner",
                "Intermediate",
                "Advanced"
            ],
            default: "Beginner"
        },

        duration: {
            type: Number,
            required: true,
            min: 1
        },

        price: {
            type: Number,
            required: true,
            min: 0,
        },

        capacity: {
            type: Number,
            required: true,
            min: 1
        },

        mode: {
            type: String,
            enum: ["Online", "Offline"],
            default: "Online"
        },

        thumbnail: {
            public_id: {
                type: String,
                default: null
            },
            url: {
                type: String,
                default: null
            }
        },

        scheduleDate: {
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

        status: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("Class", classSchema);