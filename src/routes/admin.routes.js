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

import { adminAuth, auth } from "../middleware/auth.middleware.js";

import { isAdmin } from "../middleware/role.middleware.js";

import upload from "../middleware/upload.middleware.js";


const router = express.Router();


router.post("/login", adminLogin);

router.get("/dashboard", adminAuth, isAdmin, getDashboardStats);

router.get("/users", adminAuth, getAllUsers);

router.patch("/users/:id/status", adminAuth, updateUserStatus);

router.get("/instructors", adminAuth, getAllInstructors);

router.get("/classes", adminAuth, getAllClasses);

router.get("/class-sessions", adminAuth, getAllClassSessions);

router.get("/bookings", adminAuth, getAllBookings);

router.get("/payments", adminAuth, getAllPayments);

router.get("/blogs", adminAuth, getAllBlogs);

router.post("/logout", adminAuth, adminLogout);

router.get("/profile", auth, isAdmin, getAdminProfile);

router.put("/update-profile", auth, isAdmin, updateAdminProfile);

router.put("/profile-image", auth, isAdmin, upload.single("profileImage"), updateAdminProfileImage);

router.put("/change-password", auth, isAdmin, changeAdminPassword);


export default router;