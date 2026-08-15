import Instructor from "../models/instructor.model.js";
import User from "../models/user.model.js";
import mongoose from "mongoose";

export const createInstructorProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (user.role !== "instructor") {
            return res.status(403).json({
                success: false,
                message: "Only instructors can create instructor profile"
            });
        }

        const existingProfile = await Instructor.findOne({ userId });

        if (existingProfile) {
            return res.status(409).json({
                success: false,
                message: "Instructor profile is already exists"
            })
        }

        const {
            bio,
            qualification,
            experience,
            expertise,
            languages,
            fees,
        } = req.body;

        const instructor = await Instructor.create({
            userId,
            bio,
            qualification,
            experience,
            expertise,
            languages,
            fees
        });

        return res.status(200).json({
            success: true,
            message: "Instructor profile created successfully",
            data: instructor
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getAllInstructors = async (req, res) => {
    try {

        const instructors = await Instructor.find({ status: true })
            .populate({
                path: "userId",
                select: "name profileImage"
            })
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: instructors.length,
            data: instructors
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getInstructorById = async (req, res) => {
    try {

        const { id } = req.params;

        const instructor = await Instructor.findById(id)
            .populate({
                path: "userId",
                select: "name profileImage"
            });

        if (!instructor || !instructor.status) {
            return res.status(404).json({
                success: false,
                message: "Instructor not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: instructor
        });

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid instructor id"
            });
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const updateProfileInstructor = async (req, res) => {
    try {
        const userId = req.user.id;

        const instructor = await Instructor.findOne({ userId });

        if (!instructor) {
            return res.status(404).json({
                success: false,
                message: "Instructor profile not found"
            });
        }

        const {
            bio,
            qualification,
            experience,
            expertise,
            languages,
            fees,
            availability
        } = req.body;

        instructor.bio = bio ?? instructor.bio;
        instructor.qualification = qualification ?? instructor.qualification;
        instructor.experience = experience ?? instructor.experience;
        instructor.expertise = expertise ?? instructor.expertise;
        instructor.languages = languages ?? instructor.languages;
        instructor.fees = fees ?? instructor.fees;
        instructor.availability = availability ?? instructor.availability;

        await instructor.save();

        return res.status(200).json({
            success: true,
            message: "Instructor profile updated successfully",
            data: instructor
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const deleteInstructorProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        const instructor = await Instructor.findOne({userId});

        if(!instructor) {
            return res.status(404).json({
                success: false,
                message: "Instructor profile not found"
            });
        }

        instructor.status = false;
        await instructor.save();

        return res.status(200).json({
            success: true,
            message: "Instructor profile deleted successfully."
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

