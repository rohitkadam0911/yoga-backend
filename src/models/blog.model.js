import mongoose from "mongoose";

const Schema = mongoose.Schema;

const blogSchema = new Schema(
    {
        authorId: {
            type:Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        title: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            required: true,
            trim: true,
        },

        content: {
            type: String,
            required: true,
        },

        category: {
            type: String,
            enum: [
                "Yoga",
                "Meditation",
                "Fitness",
                "Health",
                "Lifestyle"
            ],
            required: true
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

        status: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model("Blog", blogSchema);