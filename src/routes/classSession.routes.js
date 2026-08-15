import express from "express";

import { createClassSession, getAllClassSessions, getClassSessionsByClass, 
    getClassSessionById, updateClassSession, deleteClassSession } 
    from "../controllers/classSession.controller.js";
import { auth } from "../middleware/auth.middleware.js";
import { isAdmin } from "../middleware/role.middleware.js";

const router = express.Router();

router.post("/create", auth, isAdmin, createClassSession);
router.get("/", getAllClassSessions);
router.get("/class/:classId", getClassSessionsByClass);
router.get("/:id", getClassSessionById);
router.put("/:id", auth, isAdmin, updateClassSession);
router.delete("/:id", auth, isAdmin, deleteClassSession);

export default router;