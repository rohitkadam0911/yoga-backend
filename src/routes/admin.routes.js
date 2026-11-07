import express from "express";

import {
    adminLogin,
    adminLogout,
    getAllBookings,
    getAllClasses,
    getAllClassSessions,
    getAllInstructors,
    getAllUsers,
    getDashboardStats,
    updateUserStatus,
    getAllPayments,
    getAllBlogs, 
    getAdminProfile,
    updateAdminProfile,
    updateAdminProfileImage,
    changeAdminPassword
} from "../controllers/admin.controller.js";

import { adminAuth } from "../middleware/auth.middleware.js";

import upload from "../middleware/upload.middleware.js";


const router = express.Router();


router.post("/login", adminLogin);

router.get("/dashboard", adminAuth, getDashboardStats);

router.get("/users", adminAuth, getAllUsers);

router.patch("/users/:id/status", adminAuth, updateUserStatus);

router.get("/instructors", adminAuth, getAllInstructors);

router.get("/classes", adminAuth, getAllClasses);

router.get("/class-sessions", adminAuth, getAllClassSessions);

router.get("/bookings", adminAuth, getAllBookings);

router.get("/payments", adminAuth, getAllPayments);

router.get("/blogs", adminAuth, getAllBlogs);

router.post("/logout", adminAuth, adminLogout);

router.get("/profile", adminAuth, getAdminProfile);

router.put("/update-profile", adminAuth, updateAdminProfile);

router.put("/profile-image", adminAuth, upload.single("profileImage"), updateAdminProfileImage);

router.put("/change-password", adminAuth, changeAdminPassword);


export default router;
