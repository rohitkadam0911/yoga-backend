import mongoose from "mongoose";
import Class from "../models/class.model.js";
import Instructor from "../models/instructor.model.js";
import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";

export const createClass = async (req, res) => {
    try {

        const userId = req.user.id;

        let instructor;

        if (req.user.role === "instructor") {

            instructor = await Instructor.findOne({
                userId,
                status: true
            });

            if (!instructor) {
                return res.status(404).json({
                    success: false,
                    message: "Instructor profile not found"
                });
            }

        } else if (req.user.role === "admin") {

            const { instructorId } = req.body;

            instructor = await Instructor.findOne({
                _id: instructorId,
                status: true
            });

            if (!instructor) {
                return res.status(404).json({
                    success: false,
                    message: "Instructor not found"
                });
            }
        }

        let thumbnail = {
            public_id: null,
            url: null
        };

        if (req.file) {

            const result = await uploadToCloudinary(
                req.file.buffer,
                "YogaConnect/Class"
            );

            thumbnail = {
                public_id: result.public_id,
                url: result.secure_url
            };
        }

        const {
            title,
            description,
            category,
            level,
            duration,
            price,
            capacity,
            mode,
            scheduleDate,
            startTime,
            endTime
        } = req.body;

        const yogaClass = await Class.create({
            instructorId: instructor._id,
            title,
            description,
            category,
            level,
            duration,
            price,
            capacity,
            mode,
            scheduleDate,
            startTime,
            endTime,
            thumbnail
        });

        const data = await Class.findById(yogaClass._id)
            .populate({
                path: "instructorId",
                populate: {
                    path: "userId",
                    select: "name email phone profileImage"
                }
            });

        return res.status(201).json({
            success: true,
            message: "Class created successfully",
            data
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

export const getAllClasses = async (req, res) => {
    try {
        const classes = await Class.find({ status: true })
            .populate({
                path: "instructorId",
                populate: {
                    path: "userId",
                    select: "name email phone profileImage"
                }
            })
            .sort({ scheduleDate: 1 });

        return res.status(200).json({
            success: true,
            count: classes.length,
            data: classes
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getClassById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid class ID"
            });
        }

        const yogaClass = await Class.findById(id)
            .populate({
                path: "instructorId",
                populate: {
                    path: "userId",
                    select: "name email phone profileImage"
                }
            });

        if (!yogaClass || !yogaClass.status) {
            return res.status(404).json({
                success: false,
                message: "Class not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: yogaClass
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const updateClass = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid class ID"
            });
        }

        const yogaClass = await Class.findById(id);

        if (!yogaClass || !yogaClass.status) {
            return res.status(404).json({
                success: false,
                message: "Class not found"
            });
        }

        if (req.user.role === "instructor") {

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

            if (yogaClass.instructorId.toString() !== instructor._id.toString()) {
                return res.status(403).json({
                    success: false,
                    message: "You can update only your own classes"
                });
            }
        }

        const {
            title,
            description,
            category,
            level,
            duration,
            price,
            capacity,
            mode,
            scheduleDate
        } = req.body;

        yogaClass.title = title ?? yogaClass.title;
        yogaClass.description = description ?? yogaClass.description;
        yogaClass.category = category ?? yogaClass.category;
        yogaClass.level = level ?? yogaClass.level;
        yogaClass.duration = duration ?? yogaClass.duration;
        yogaClass.price = price ?? yogaClass.price;
        yogaClass.capacity = capacity ?? yogaClass.capacity;
        yogaClass.mode = mode ?? yogaClass.mode;
        yogaClass.scheduleDate = scheduleDate ?? yogaClass.scheduleDate;
        yogaClass.startTime = startTime ?? yogaClass.startTime;
        yogaClass.endTime = endTime ?? yogaClass.endTime;

        await yogaClass.save();

        return res.status(200).json({
            success: true,
            message: "Class updated successfully",
            data: yogaClass
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

export const deleteClass = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid class ID"
            });
        }

        const yogaClass = await Class.findById(id);

        if (!yogaClass || !yogaClass.status) {
            return res.status(404).json({
                success: false,
                message: "Class not found"
            });
        }

        let instructor;

        if (req.user.role === "instructor") {
            instructor = await Instructor.findOne({
                userId: req.user.id,
                status: true
            });

            if (!instructor) {
                return res.status(404).json({
                    success: false,
                    message: "Instructor profile not found"
                });
            }

            if (yogaClass.instructorId.toString() !== instructor._id.toString()) {
                return res.status(403).json({
                    success: false,
                    message: "You can delete only your own classes"
                });
            }
        }

        yogaClass.status = false;
        await yogaClass.save();

        return res.status(200).json({
            success: true,
            message: "Class deleted successfully"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};