import express from "express";
import {auth} from "../middleware/auth.middleware.js";
import {classValidator} from "../validators/class.validator.js";
import { createClass, deleteClass, getAllClasses, getClassById, updateClass } from "../controllers/class.controller.js";
import { isInstructorOrAdmin } from "../middleware/role.middleware.js";
import upload from "../middleware/upload.middleware.js";

const router = express.Router();

router.post("/", auth, isInstructorOrAdmin, upload.single("thumbnail"),classValidator, createClass);
router.get("/", getAllClasses);
router.get("/:id", getClassById);
router.put("/:id", auth, isInstructorOrAdmin, updateClass);
router.delete("/:id", auth, isInstructorOrAdmin, deleteClass);

export default router;