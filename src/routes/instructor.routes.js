import express from "express";

import { createInstructorProfile, deleteInstructorProfile, getAllInstructors, getInstructorById, updateProfileInstructor, getInstructorDashboard, getMyInstructorProfile} from "../controllers/instructor.controller.js";
import { instructorValidator } from "../validators/instructor.validator.js";
import { auth } from "../middleware/auth.middleware.js";
import { isInstructor } from "../middleware/role.middleware.js";

const router = express.Router();

router.post("/create-profile", auth, isInstructor, instructorValidator, createInstructorProfile );
router.get("/", getAllInstructors);
router.get("/me", auth, getMyInstructorProfile);
router.get("/:id", getInstructorById);
router.put("/update-profile", auth, isInstructor, updateProfileInstructor );
router.delete("/delete-profile", auth, isInstructor, deleteInstructorProfile );
router.get("/dashboard", auth, isInstructor, getInstructorDashboard);

export default router;