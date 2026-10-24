import express from "express";

import { adminAuth, classAuth, auth } from "../middleware/auth.middleware.js";
import { classValidator } from "../validators/class.validator.js";
import {createClass, deleteClass, getAllClasses, getClassById, getMyClasses, updateClass } from "../controllers/class.controller.js";
import {isInstructorOrAdmin } from "../middleware/role.middleware.js";
import upload from "../middleware/upload.middleware.js";

const router = express.Router();

router.post("/", classAuth, isInstructorOrAdmin, upload.single("thumbnail"), classValidator, createClass);
router.get("/my-classes", auth, isInstructorOrAdmin, getMyClasses);
router.get("/", getAllClasses);
router.get("/:id", getClassById);
router.put("/:id", classAuth, isInstructorOrAdmin, upload.single("thumbnail"), updateClass);
router.delete("/:id", classAuth, isInstructorOrAdmin, deleteClass);

export default router;