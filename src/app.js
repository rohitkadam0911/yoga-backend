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

const app = express();

const allowedOrigins = [
    process.env.FRONTEND_URL,
    "http://localhost:3000"
].filter(Boolean);

app.use(
    cors({
        origin(origin, callback) {
            // Requests without an Origin header (for example health checks) are allowed.
            if (!origin || allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            return callback(new Error("Not allowed by CORS"));
        },
        credentials: true,

        methods: [
            "GET",
            "POST",
            "PUT",
            "PATCH",
            "DELETE",
            "OPTIONS"
        ],

        allowedHeaders: [
            "Content-Type",
            "Authorization"
        ]
    })
);


app.use(express.json());

app.use(
    express.urlencoded({
        extended: true
    })
);

app.use(cookieParser());

app.get("/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "🚀 Welcome to YogaConnect Backend API",
        version: "v1.0.0",
        status: "Server is running successfully ✅",
        api: "/api/v1/users"
    });
});

app.use("/api/v1/users", userRoutes);

app.use("/api/v1/instructors", instructorRoutes);

app.use("/api/v1/classes", classRoutes);

app.use("/api/v1/blogs", blogRoutes);

app.use("/api/v1/bookings", bookingRoutes);

app.use("/api/v1/payments", paymentRoutes);

app.use("/api/v1/class-sessions", classSessionRoutes);

export default app;
