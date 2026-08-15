import mongoose from "mongoose";

const Schema = mongoose.Schema;

const instructorSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },
        bio: {
            type: String,
            trim: true,
            default: "",
        },
        qualification: {
            type: String,
            trim: true,
            default: "",
        },
        experience: {
            type: Number,
            default: 0,
        },
        expertise: [
            {
                type: String,
                trim: true,
            },
        ],
        languages: [
            {
                type: String,
                trim: true,
            },
        ],
        fees: {
            type: Number,
            required: true,
            default: 0
        },
        availability: {
            type: Boolean,
            default: true,
        },
        rating: {
            type: Number,
            default: 0,
        },
        totalReviews: {
            type: Number,
            default: 0,
        },
        status: {
            type: Boolean,
            default: true,
        },
    },{
        timestamps: true
    },
);

export default mongoose.model("Instructor", instructorSchema);