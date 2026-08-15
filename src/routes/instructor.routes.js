import express from "express";
import { createInstructorProfile, deleteInstructorProfile, getAllInstructors, getInstructorById, updateProfileInstructor } from "../controllers/instructor.controller.js";
import {instructorValidator} from "../validators/instructor.validator.js"
import {auth} from "../middleware/auth.middleware.js";

const router = express.Router()

router.post("/create-profile", auth, instructorValidator, createInstructorProfile);
router.get("/", getAllInstructors);
router.get("/:id", getInstructorById);
router.put("/update-profile", auth, updateProfileInstructor)
router.delete("/delete-profile", auth, deleteInstructorProfile)
export default router;