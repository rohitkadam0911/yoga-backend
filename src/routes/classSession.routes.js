import express from "express";

import {createClassSession, getAllClassSessions, getInstructorClassSessions,
  getClassSessionsByClass, getClassSessionById, updateClassSession, deleteClassSession, } from "../controllers/classSession.controller.js";

import { auth, classAuth, } from "../middleware/auth.middleware.js";

import { isInstructor, isInstructorOrAdmin, } from "../middleware/role.middleware.js";

const router = express.Router();

router.post("/create", classAuth, isInstructorOrAdmin, createClassSession);

router.get("/instructor", auth, isInstructor, getInstructorClassSessions);
router.get("/", getAllClassSessions);
router.get("/class/:classId", getClassSessionsByClass);
router.get("/:id", getClassSessionById);

router.put("/:id", classAuth, isInstructorOrAdmin, updateClassSession);
router.delete("/:id", classAuth, isInstructorOrAdmin, deleteClassSession);

export default router;