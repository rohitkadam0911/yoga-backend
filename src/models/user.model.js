import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const userSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
        },
        phone: {
            type: String,
            default: null,
        },
        role: {
            type: String,
            enum: ["user", "instructor", "admin"],
            default: "user"
        },
        profileImage: {
            public_id: {
                type: String,
                default: null
            },
            url: {
                type: String,
                default: null
            }
        },
        isVerified: {
            type: Boolean,
            default: false
        },
        otp: {
            type: String,
            default: null,
        },
        otpExpire: {
            type: Date,
            default: null,
        },
        resetPasswordAllowed: {
            type: Boolean,
            default: false
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

export default mongoose.model("User", userSchema)