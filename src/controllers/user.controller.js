import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { sendEmail } from "../utils/mailer.js";
import cloudinary from "../config/cloudinary.js";
import {uploadToCloudinary} from "../utils/uploadToCloudinary.js";

export const signup = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "User already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            phone,
            role: "user"
        });

        const { password: pass, ...userData } = user.toObject();

        return res.status(201).json({
            success: true,
            message: "Signup Successfully",
            data: userData
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const existingUser = await User.findOne({ email });

        if (!existingUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, existingUser.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid Credentials" });
        }

        const token = jwt.sign(
            { id: existingUser._id, role: existingUser.role },
            process.env.JWT_SECRET_KEY,
            { expiresIn: "7d" }
        );

        const isProduction = process.env.NODE_ENV === "production";

        res.cookie("token", token, {
            httpOnly: true,
            // The frontend and Render API are cross-site in production.
            secure: isProduction,
            sameSite: isProduction ? "none" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        const { password: pass, ...userData } = existingUser.toObject();

        return res.status(200).json({
            success: true,
            message: "Login Successfully",
            data: userData, // no token in body anymore
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const logout = async (req, res) => {
    try {
        const isProduction = process.env.NODE_ENV === "production";

        res.clearCookie("token", {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "none" : "lax",
        });

        return res.status(200).json({
            success: true,
            message: "Logged out successfully"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    // Check email
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Check user
    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // OTP expiry (10 minutes)
    const otpExpire = new Date(Date.now() + 10 * 60 * 1000);

    // Save OTP
    await User.findOneAndUpdate(
      { email },
      {
        otp,
        otpExpire,
      },
      { new: true,
        returnDocument: 'after' 
       }
    );

    // Send email
    await sendEmail(email, otp);

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error("Send OTP Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const existingUser = await User.findOne({ email });

        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: "User Not Found"
            });
        }

        if (existingUser.otp !== otp) {
            return res.status(400).json({
                success: false,
                message: "Invalid Otp"
            });
        }

        if (existingUser.otpExpire < Date.now()) {
            return res.status(400).json({
                success: false,
                message: "OTP Expired"
            });
        }

        await User.updateOne(
            { email },
            {
                $set: {
                    isVerified: true,
                    resetPasswordAllowed: true,
                    otp: null,
                    otpExpire: null
                }
            }
        );

        return res.status(200).json({
            success: true,
            message: "Otp Verified Successfully"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, otp , password, confirmPassword } = req.body;

    if (!password || !confirmPassword || password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Password and Confirm Password does not match',
      });
    }

    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.updateOne(
      { email },
      {
        $set: {
          password: hashedPassword,
          resetPasswordAllowed: false,
        },
        $unset: {
          otp: 1,
        },
      }
    );

    return res.status(200).json({
      success: true,
      message: 'Password Reset Successfully',
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
};

export const changePassword = async (req, res) =>{
    try {
        
        const { oldPassword, newPassword, confirmPassword } =req.body;

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Password do not match"
            });
        }

        const existingUser = await User.findById(req.user.id);

        const checkPassword = await bcrypt.compare(
            oldPassword,
            existingUser.password
        );

        if(!checkPassword) {
            return res.status(401).json({
                success: false,
                message: "Old password is incorrect"
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        existingUser.password = hashedPassword;

        await existingUser.save();

        return res.status(200).json({
            success: true,
            message: "Password Changed Successfully"
        });
     } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
        .select("-password -otp -otpExpire");
        
        return res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const updateProfile = async (req, res) => {
    try {

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        const {
            name,
            phone
        } = req.body;

        user.name = name ?? user.name;
        user.phone = phone ?? user.phone;

        if (req.file) {

            if (user.profileImage?.public_id) {
                await cloudinary.uploader.destroy(
                    user.profileImage.public_id
                );
            }

            const result = await uploadToCloudinary(
                req.file.buffer,
                "YogaConnect/Profile"
            );

            user.profileImage = {
                public_id: result.public_id,
                url: result.secure_url
            };
        }

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: user
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const deleteAccount = async (req, res) => {
    try {
        await User.findByIdAndUpdate(
            req.user.id,
            {
                status: false
            }
        );

        return res.status(200).json({
            success: true,
            message:"Account Deleted Successfully"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const updateProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload an image",
      });
    }

    const existingUser = await User.findById(req.user.id);

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // जुनी Cloudinary image Delete करा
    if (existingUser.profileImage?.public_id) {
      await cloudinary.uploader.destroy(
        existingUser.profileImage.public_id
      );
    }

    // नवीन image Cloudinary वर Upload करा
    const result = await uploadToCloudinary(
      req.file.buffer,
      "YogaConnect/users"
    );

    // Profile Image Update करा
    existingUser.profileImage = {
      public_id: result.public_id,
      url: result.secure_url,
    };

    await existingUser.save();

    // Password काढून safe user object तयार करा
    const userWithoutPassword = existingUser.toObject();
    delete userWithoutPassword.password;

    return res.status(200).json({
      success: true,
      message: "Profile Image Updated Successfully",
      user: userWithoutPassword, // <-- पूर्ण user object पाठवला आहे
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

