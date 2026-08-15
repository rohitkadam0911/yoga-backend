import express from 'express';
import { changePassword, deleteAccount, getProfile, login, logout, resetPassword, sendOtp, signup, updateProfile, verifyOtp } from "../controllers/user.controller.js"
import { auth } from '../middleware/auth.middleware.js';
import { isAdmin, isInstructor, isUser} from '../middleware/role.middleware.js'
import { signupValidator, loginValidator, sendOtpValidator, verifyOtpValidator, resetPasswordValidator, changePasswordValidator, updateProfileValidator } from "../validators/user.validators.js"
import upload from "../middleware/upload.middleware.js";
import { updateProfileImage } from '../controllers/user.controller.js';

const router = express.Router();

router.post("/signup", signupValidator, signup);
router.post("/login",loginValidator, login);
router.post("/logout", auth, logout);
router.post("/send-otp", sendOtpValidator, sendOtp);
router.post("/verify-otp", verifyOtpValidator, verifyOtp);
router.put("/reset-password", resetPasswordValidator, resetPassword);
router.put("/change-password", auth,changePasswordValidator, changePassword);

router.get("/profile", auth, getProfile);
router.put("/update-profile", auth, upload.single("profileImage"), updateProfile);
router.delete("/delete-account", auth, deleteAccount);
router.put("/profile-image", auth, upload.single("profileImage"), updateProfileImage);

export default router;