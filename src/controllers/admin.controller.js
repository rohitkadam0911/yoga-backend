import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import Instructor from "../models/instructor.model.js";
import Class from "../models/class.model.js";
import ClassSession from "../models/classSession.model.js";
import Booking from "../models/booking.model.js";
import Payment from "../models/payment.model.js";
import Blog from "../models/blog.model.js";
// import { promises } from "fs";

export const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        const user = await User.findOne({
            email,
            role: "admin",
            status: true
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid admin credentials"
            });
        }

        const isPasswordValid = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid admin credentials"
            });
        }

        const token = jwt.sign(
            {
                id: user._id,
                role: user.role
            },
            process.env.JWT_SECRET_KEY,
            {
                expiresIn: "7d"
            }
        );

        res.cookie("adminToken", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production"
                ? "none"
                : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.status(200).json({
            success: true,
            message: "Admin login successful",
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                profileImage: user.profileImage
            }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const adminLogout = async (req, res) => {
    try {
        res.clearCookie("adminToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production"
                ? "none"
                : "lax"
        });

        return res.status(200).json({
            success: true,
            message: "Admin logout successful"
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getDashboardStats = async (req, res) => {
    try {
        // counts
        const [
            totalUsers,
            totalInstructors,
            totalClasses,
            totalSessions,
            totalBookings,
            totalBlogs
        ] = await Promise.all([
            User.countDocuments({
                role: "user",
                status: true
            }),

            Instructor.countDocuments({
                status: true
            }),

            Class.countDocuments({
                status: true
            }),

            ClassSession.countDocuments({
                status: true
            }),

            Booking.countDocuments({
                status: true
            }),

            Blog.countDocuments({
                status: true
            })
        ]);

        // booking stats

        const [
            bookedBookings,
            cancelledBookings,
            completedBookings,
        ] = await Promise.all([

            Booking.countDocuments({
                bookingStatus: "Booked",
                status: true
            }),

            Booking.countDocuments({
                bookingStatus: "Cancelled",
                status: true
            }),

            Booking.countDocuments({
                bookingStatus: "Completed",
                status: true
            })
        ]);

        // payments stats
        const [
            paidPayments,
            pendingPayments,
            failedPayments,
            refundedPayments
        ] = await Promise.all([
            Payment.countDocuments({
                paymentStatus: "Paid",
                status: true
            }),
            Payment.countDocuments({
                paymentStatus: "Pending",
                status: true
            }),
            Payment.countDocuments({
                paymentStatus: "Failed",
                status: true
            }),
            Payment.countDocuments({
                paymentStatus: "Refunded",
                status: true
            })
        ]);

        // revenue
        const revenueResult = await Payment.aggregate([
            {
                $match: {
                    paymentStatus: "Paid",
                    status: true
                }
            }, {
                $group: {
                    _id: null,
                    totalRevenue: {
                        $sum: "$amount"
                    }
                }
            }
        ]);

        const totalRevenue =
            revenueResult.length > 0
                ? revenueResult[0].totalRevenue
                : 0;

        // recent booking
        const recentBookings = await Booking.find({
            status: true
        })
            .populate({
                path: "userId",
                select: "name email profileImage"
            })
            .populate({
                path: "classId",
                select: "title category mode"
            })
            .populate({
                path: "instructorId",
                select: "userId",
                populate: {
                    path: "userId",
                    select: "name"
                }
            })
            .sort({
                createdAt: -1
            })
            .limit(5);

        // recent user
        const recentUsers = await User.find({
            role: "user",
            status: true
        })
            .select("-password -otp -otpExpire")
            .sort({
                createdAt: -1
            })
            .limit(5);

        // recent blogs
        const recentBlogs = await Blog.find({
            status: true
        })
            .populate({
                path: "authorId",
                select: "name profileImage"
            })
            .sort({
                createdAt: -1
            })
            .limit(5);

        // response
        return res.status(200).json({
            success: true,
            data: {
                counts: {
                    users: totalUsers,
                    instructors: totalInstructors,
                    classes: totalClasses,
                    session: totalSessions,
                    bookings: totalBookings,
                    blogs: totalBlogs
                },

                bookings: {
                    booked: bookedBookings,
                    cancelled: cancelledBookings,
                    completed: completedBookings
                },

                payments: {
                    paid: paidPayments,
                    pending: pendingPayments,
                    failed: failedPayments,
                    refunded: refundedPayments
                },

                revenue: {
                    total: totalRevenue
                },

                recentBookings,
                recentUsers,
                recentBlogs
            }

        });

    } catch (error) {

        console.error(
            "Admin Dashboard Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({
            role: "user"
        })
            .select("-password -otp -otpExpire")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const updateUserStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findOne({
            _id: id,
            role: "user"
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        user.status = !user.status;

        await user.save();

        return res.status(200).json({
            success: true,
            message: user.status
                ? "User activated successfully"
                : "User deactivated successfully",
            data: {
                _id: user._id,
                status: user.status
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

export const getAllInstructors = async (req, res) => {
    try {
        const instructors = await Instructor.find({
            status: true,
        })
            .populate({
                path: "userId",
                select: "name email phone profileImage isVerified status"
            })
            .sort({
                createdAt: -1
            });

        return res.status(200).json({
            success: true,
            count: instructors.length,
            data: instructors
        })
    } catch (error) {
        console.error(
            "Get all instructors error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getAllClasses = async (req, res) => {
    try {
        const classes = await Class.find()
        .populate({
            path:"instructorId",
            select: "userId qualification experience rating",
            populate: {
                path: "userId",
                select: "name email profileImage"
            }
        })
        .sort({
            createdAt: -1
        });

        return res.status(200).json({
            success: true,
            count: classes.length,
            data: classes
        });
    } catch (error) {
        console.error(
            "Get All Classes Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getAllClassSessions = async (req, res) => {
    try {

        const sessions = await ClassSession.find()
            .populate("classId");

        return res.status(200).json({
            success: true,
            count: sessions.length,
            data: sessions
        });

    } catch (error) {

        console.error("Get All Class Sessions Error:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate({
                path: "userId",
                select: "name email profileImage"
            })
            .populate({
                path: "classId",
                select: "title category mode"
            })
            .populate({
                path: "instructorId",
                select: "userId",
                populate: {
                    path: "userId",
                    select: "name"
                }
            })
            .sort({
                createdAt: -1
            });

        return res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings
        });
    } catch (error) {
        console.error("Get All Bookings Error:", error);

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
        .populate({
            path: "userId",
            select: "name email profileImage"
        })
        .populate({
            path: "bookingId",
            select: "bookingStatus bookingDate"
        })
        .sort({ createdAt: -1 });

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

export const getAllBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find({
            status: true
        })
            .populate({
                path: "authorId",
                select: "name email profileIamge"
            })
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: blogs.length,
            data: blogs
        })
    } catch (error) {
        console.error("Get All Blogs Error:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getAdminProfile = async (req, res) => {
    try {
        const admin = await User.findOne({
            _id: req.user.id,
            role: "admin"
        }).select("-password");

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: "Admin not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: admin
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const updateAdminProfile = async (req, res) => {
    try {
        const admin = await User.findOne({
            _id: req.user.id,
            role: "admin"
        });

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: "Admin not found"
            });
        }

        const { name, phone } = req.body;

        admin.name = name ?? admin.name;
        admin.phone = phone ?? admin.phone;

        await admin.save();

        return res.status(200).json({
            success: true,
            message: "Admin profile updated successfully",
            data: admin
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const updateAdminProfileImage = async (req, res) => {
    try {
        const admin = await User.findOne({
            _id: req.user.id,
            role: "admin"
        });

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: "Admin not found"
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Profile image is required"
            });
        }

        const result = await uploadToCloudinary(
            req.file.buffer,
            "YogaConnect/Profile"
        );

        admin.profileImage = {
            public_id: result.public_id,
            url: result.secure_url
        };

        await admin.save();

        return res.status(200).json({
            success: true,
            message: "Admin profile image updated successfully",
            data: admin
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const changeAdminPassword = async (req, res) => {
    try {
        const {
            oldPassword,
            newPassword,
            confirmPassword
        } = req.body;

        if (!oldPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "All password fields are required"
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "New passwords do not match"
            });
        }

        const admin = await User.findOne({
            _id: req.user.id,
            role: "admin"
        });

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: "Admin not found"
            });
        }

        const isMatch = await bcrypt.compare(
            oldPassword,
            admin.password
        );

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Current password is incorrect"
            });
        }

        admin.password = await bcrypt.hash(
            newPassword,
            10
        );

        await admin.save();

        return res.status(200).json({
            success: true,
            message: "Admin password changed successfully"
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
