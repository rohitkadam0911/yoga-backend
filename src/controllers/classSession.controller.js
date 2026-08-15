import mongoose from "mongoose";
import ClassSession from "../models/classSession.model.js";
import Class from "../models/class.model.js";
import Instructor from "../models/instructor.model.js";

export const createClassSession = async (req, res) => {
    try {
        const {
            classId,
            instructorId,
            date,
            startTime,
            endTime,
            capacity
        } = req.body;

        if (!classId || !mongoose.Types.ObjectId.isValid(classId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Class ID"
            });
        }

        if (
            !instructorId ||
            !mongoose.Types.ObjectId.isValid(instructorId)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid Instructor ID"
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

        const instructor = await Instructor.findOne({
            _id: instructorId,
            status: true
        });

        if (!instructor) {
            return res.status(404).json({
                success: false,
                message: "Instructor not found"
            });
        }

        if (!date) {
            return res.status(400).json({
                success: false,
                message: "Session date is required"
            });
        }

        const sessionDate = new Date(date);

        if (isNaN(sessionDate.getTime())) {
            return res.status(400).json({
                success: false,
                message: "Invalid session date"
            });
        }

        if (!startTime || !endTime) {
            return res.status(400).json({
                success: false,
                message: "Start time and end time are required"
            });
        }

        if (!capacity || Number(capacity) <= 0) {
            return res.status(400).json({
                success: false,
                message: "Valid capacity is required"
            });
        }

        const existingSession = await ClassSession.findOne({
            classId,
            instructorId,
            date: sessionDate,
            startTime,
            endTime,
            status: true
        });

        if (existingSession) {
            return res.status(409).json({
                success: false,
                message: "This class session already exists"
            });
        }

        const session = await ClassSession.create({
            classId,
            instructorId,
            date: sessionDate,
            startTime,
            endTime,
            capacity: Number(capacity),
            bookedSeats: 0,
            status: true
        });

        const populatedSession = await ClassSession.findById(
            session._id
        )
            .populate({
                path: "classId",
                select: "title description category level duration price capacity mode thumbnail"
            })
            .populate({
                path: "instructorId",
                select: "userId qualification experience"
            });

        return res.status(201).json({
            success: true,
            message: "Class session created successfully",
            data: populatedSession
        });
    } catch (error) {
        console.error(
            "Create Class Session Error:",
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
        const sessions = await ClassSession.find({
            status: true
        })
            .populate({
                path: "classId",
                select: "title description category level duration price capacity mode thumbnail"
            })
            .populate({
                path: "instructorId",
                select: "userId qualification experience"
            })
            .sort({
                date: 1,
                startTime: 1
            });

        return res.status(200).json({
            success: true,
            count: sessions.length,
            data: sessions
        });
    } catch (error) {
        console.error(
            "Get All Class Sessions Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getClassSessionsByClass = async (req, res) => {
    try {
        const { classId } = req.params;

        if (
            !classId ||
            !mongoose.Types.ObjectId.isValid(classId)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid Class ID"
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

        const sessions = await ClassSession.find({
            classId: classId,
            status: true
        })
            .populate({
                path: "classId",
                select:
                    "title description category level duration price capacity mode thumbnail"
            })
            .populate({
                path: "instructorId",
                select:
                    "userId qualification experience"
            })
            .sort({
                date: 1,
                startTime: 1
            });

        return res.status(200).json({
            success: true,
            count: sessions.length,
            data: sessions
        });
    } catch (error) {
        console.error(
            "Get Class Sessions Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getClassSessionById = async (req, res) => {
    try {
        const { id } = req.params;

        if (
            !id ||
            !mongoose.Types.ObjectId.isValid(id)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid Session ID"
            });
        }

        const session = await ClassSession.findOne({
            _id: id,
            status: true
        })
            .populate({
                path: "classId",
                select:
                    "title description category level duration price capacity mode thumbnail"
            })
            .populate({
                path: "instructorId",
                select:
                    "userId qualification experience"
            });

        if (!session) {
            return res.status(404).json({
                success: false,
                message: "Class session not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: session
        });
    } catch (error) {
        console.error(
            "Get Class Session By ID Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const updateClassSession = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            date,
            startTime,
            endTime,
            capacity,
            instructorId
        } = req.body;

        if (
            !id ||
            !mongoose.Types.ObjectId.isValid(id)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid Session ID"
            });
        }

        const session = await ClassSession.findOne({
            _id: id,
            status: true
        });

        if (!session) {
            return res.status(404).json({
                success: false,
                message: "Class session not found"
            });
        }

        if (instructorId) {
            if (
                !mongoose.Types.ObjectId.isValid(
                    instructorId
                )
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid Instructor ID"
                });
            }

            const instructor =
                await Instructor.findOne({
                    _id: instructorId,
                    status: true
                });

            if (!instructor) {
                return res.status(404).json({
                    success: false,
                    message: "Instructor not found"
                });
            }

            session.instructorId = instructorId;
        }

        if (date) {
            const sessionDate = new Date(date);

            if (
                isNaN(sessionDate.getTime())
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid session date"
                });
            }

            session.date = sessionDate;
        }

        if (startTime) {
            session.startTime = startTime;
        }

        if (endTime) {
            session.endTime = endTime;
        }

        if (capacity !== undefined) {
            const newCapacity =
                Number(capacity);

            if (
                newCapacity <= 0 ||
                newCapacity < session.bookedSeats
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Capacity cannot be less than booked seats"
                });
            }

            session.capacity = newCapacity;
        }

        await session.save();

        const updatedSession =
            await ClassSession.findById(
                session._id
            )
                .populate({
                    path: "classId",
                    select:
                        "title description category level duration price capacity mode thumbnail"
                })
                .populate({
                    path: "instructorId",
                    select:
                        "userId qualification experience"
                });

        return res.status(200).json({
            success: true,
            message:
                "Class session updated successfully",
            data: updatedSession
        });
    } catch (error) {
        console.error(
            "Update Class Session Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const deleteClassSession = async (req, res) => {
    try {
        const { id } = req.params;
        if (
            !id ||
            !mongoose.Types.ObjectId.isValid(id)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid Session ID"
            });
        }
        const session = await ClassSession.findOne({
            _id: id,
            status: true
        });
        if (!session) {
            return res.status(404).json({
                success: false,
                message: "Class session not found"
            });
        }
        if (session.bookedSeats > 0) {
            return res.status(400).json({
                success: false,
                message:
                    "Cannot delete a session that has bookings"
            });
        }
        session.status = false;

        await session.save();

        return res.status(200).json({
            success: true,
            message:
                "Class session deleted successfully"
        });
    } catch (error) {
        console.error(
            "Delete Class Session Error:",
            error
        );
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


