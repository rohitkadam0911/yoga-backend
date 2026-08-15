import express from "express";

import { createBlog, deleteBlog, getAllBlogs, getBlogById, updateBlog } from "../controllers/blog.controller.js";
import { auth } from "../middleware/auth.middleware.js";
import { isInstructorOrAdmin } from "../middleware/role.middleware.js";
import upload from "../middleware/upload.middleware.js";
import {blogValidator} from "../validators/blog.validator.js";

const router = express.Router();

router.post("/", auth, isInstructorOrAdmin, upload.single("thumbnail"), blogValidator, createBlog);
router.get("/", getAllBlogs);
router.get("/:id", getBlogById);
router.put("/:id", auth, isInstructorOrAdmin, upload.single("thumbnail"), updateBlog);
router.delete("/:id", auth, isInstructorOrAdmin, deleteBlog);

export default router;

