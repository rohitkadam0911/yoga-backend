import mongoose from "mongoose";
import Booking from "../models/booking.model.js";
import Class from "../models/class.model.js";
import Instructor from "../models/instructor.model.js";
import ClassSession from "../models/classSession.model.js";

export const createBooking = async (req, res) => {
    try {
        const userId = req.user.id;

        const {
            classId,
            sessionId
        } = req.body;

        if (
            !classId ||
            !mongoose.Types.ObjectId.isValid(classId)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid Class ID"
            });
        }

        if (
            !sessionId ||
            !mongoose.Types.ObjectId.isValid(sessionId)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid Session ID"
            });
        }

        const yogaClass = await Class.findOne({
            _id: classId,
            status: true
        });

        if (!yogaClass) {
            return res.status(404).json({
                success: false,
                message: "Class not found"
            });
        }

        const session = await ClassSession.findOne({
            _id: sessionId,
            classId,
            status: true
        });

        if (!session) {
            return res.status(404).json({
                success: false,
                message: "Class session not found"
            });
        }

        if (session.bookedSeats >= session.capacity) {
            return res.status(400).json({
                success: false,
                message: "Class session is full"
            });
        }

        const existingBooking = await Booking.findOne({
            userId,
            classId,
            sessionId,
            bookingStatus: "Booked",
            status: true
        });

        if (existingBooking) {
            return res.status(409).json({
                success: false,
                message: "You have already booked this session"
            });
        }

        const booking = await Booking.create({
            userId,
            classId,
            sessionId,
            instructorId: session.instructorId,
            totalAmount: yogaClass.price
        });

        session.bookedSeats += 1;
        await session.save();

        const bookingData = await Booking.findById(booking._id)
            .populate(
                "userId",
                "name email phone profileImage"
            )
            .populate(
                "classId",
                "title category duration price mode thumbnail"
            )
            .populate(
                "sessionId",
                "date startTime endTime capacity bookedSeats"
            )
            .populate({
                path: "instructorId",
                populate: {
                    path: "userId",
                    select: "name email profileImage"
                }
            });

        return res.status(201).json({
            success: true,
            message: "Class session booked successfully",
            data: bookingData
        });
    } catch (error) {
        console.error(
            "Create Booking Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const bookingPopulate = (query) => {
    return query
        .populate(
            "userId",
            "name email phone profileImage"
        )
        .populate(
            "classId",
            "title description category level duration price mode thumbnail"
        )
        .populate(
            "sessionId",
            "date startTime endTime capacity bookedSeats status"
        )
        .populate({
            path: "instructorId",
            populate: {
                path: "userId",
                select: "name email phone profileImage"
            }
        });
};

export const getMyBookings = async (req, res) => {
    try {
        const userId = req.user.id;

        const bookings = await bookingPopulate(
            Booking.find({
                userId,
                status: true
            }).sort({
                createdAt: -1
            })
        );

        return res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings
        });
    } catch (error) {
        console.error(
            "Get My Bookings Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getSingleBooking = async (req, res) => {
    try {
        const { id } = req.params;

        if ( !id || !mongoose.Types.ObjectId.isValid(id) ) {
            return res.status(400).json({
                success: false,
                message: "Invalid Booking ID"
            });
        }

        const booking = await bookingPopulate(
            Booking.findById(id)
        );

        if (!booking || !booking.status) {
            return res.status(404).json({
                success: false,
                message: "Booking not found"
            });
        }

        if (
            req.user.role === "user" &&
            booking.userId._id.toString() !== req.user.id
        ) {
            return res.status(403).json({
                success: false,
                message: "Access denied"
            });
        }

        if (req.user.role === "instructor") {
            if (
                !booking.instructorId ||
                !booking.instructorId.userId
            ) {
                return res.status(403).json({
                    success: false,
                    message: "Access denied"
                });
            }

            const instructorUserId =
                booking.instructorId.userId._id.toString();

            if (instructorUserId !== req.user.id) {
                return res.status(403).json({
                    success: false,
                    message: "Access denied"
                });
            }
        }

        return res.status(200).json({
            success: true,
            data: booking
        });

    } catch (error) {
        console.error(
            "Get Single Booking Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const cancelBooking = async (req, res) => {
    try {
        const { id } = req.params;

        if ( !id || !mongoose.Types.ObjectId.isValid(id) ) {
            return res.status(400).json({
                success: false,
                message: "Invalid Booking ID"
            });
        }

        const booking = await Booking.findById(id);

        if (!booking || !booking.status) {
            return res.status(404).json({
                success: false,
                message: "Booking not found"
            });
        }

        if (
            req.user.role === "user" &&
            booking.userId.toString() !== req.user.id
        ) {
            return res.status(403).json({
                success: false,
                message: "Access denied"
            });
        }

        if (booking.bookingStatus === "Cancelled") {
            return res.status(400).json({
                success: false,
                message: "Booking is already cancelled"
            });
        }

        if (booking.bookingStatus === "Completed") {
            return res.status(400).json({
                success: false,
                message:
                    "Completed booking cannot be cancelled"
            });
        }

        booking.bookingStatus = "Cancelled";

        await booking.save();

        if (booking.sessionId) {
            await ClassSession.findByIdAndUpdate(
                booking.sessionId,
                {
                    $inc: {
                        bookedSeats: -1
                    }
                }
            );
        }

        const cancelledBooking =
            await bookingPopulate(
                Booking.findById(booking._id)
            );

        return res.status(200).json({
            success: true,
            message: "Booking cancelled successfully",
            data: cancelledBooking
        });

    } catch (error) {
        console.error(
            "Cancel Booking Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getAllBookings = async (req, res) => {
    try {
        const bookings = await bookingPopulate(
            Booking.find({
                status: true
            }).sort({
                createdAt: -1
            })
        );

        return res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings
        });
    } catch (error) {
        console.error(
            "Get All Bookings Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getInstructorBookings = async (req, res) => {
    try {
        const instructor = await Instructor.findOne({
            userId: req.user.id,
            status: true
        });

        if (!instructor) {
            return res.status(404).json({
                success: false,
                message: "Instructor profile not found"
            });
        }

        const bookings = await bookingPopulate(
            Booking.find({
                instructorId: instructor._id,
                status: true
            }).sort({
                createdAt: -1
            })
        );

        return res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings
        });

    } catch (error) {
        console.error(
            "Get Instructor Bookings Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};