import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import userRoutes from "./routes/user.routes.js";
import instructorRoutes from "./routes/instructor.routes.js";
import classRoutes from "./routes/class.routes.js";
import blogRoutes from "./routes/blog.routes.js";
import bookingRoutes from "./routes/booking.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import classSessionRoutes from "./routes/classSession.routes.js";
import adminRoutes from "./routes/admin.routes.js";

const app = express();

const allowedOrigins = [
    process.env.FRONTEND_URL,
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:5174"
].filter(Boolean);

app.use(
    cors({
        origin: allowedOrigins,
        credentials: true
    })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

app.get("/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "YogaConnect Backend API",
        status: "Server is running successfully"
    });
});

app.use("/api/v1/users", userRoutes);
app.use("/api/v1/instructors", instructorRoutes);
app.use("/api/v1/classes", classRoutes);
app.use("/api/v1/blogs", blogRoutes);
app.use("/api/v1/bookings", bookingRoutes);
app.use("/api/v1/payments", paymentRoutes);
app.use("/api/v1/class-sessions", classSessionRoutes);
app.use("/api/v1/admin", adminRoutes);

export default app;