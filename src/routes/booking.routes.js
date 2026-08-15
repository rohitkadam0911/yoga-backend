import express from "express";
import {
    createBooking,
    getMyBookings,
    getSingleBooking,
    cancelBooking,
    getAllBookings,
    getInstructorBookings
} from "../controllers/booking.controller.js";
import { auth } from "../middleware/auth.middleware.js";
import { isAdmin } from "../middleware/role.middleware.js";

const router = express.Router();

router.post(
    "/create",
    auth,
    createBooking
);

router.get(
    "/my-bookings",
    auth,
    getMyBookings
);

router.get(
    "/instructor",
    auth,
    getInstructorBookings
);

router.get(
    "/",
    auth,
    isAdmin,
    getAllBookings
);

router.get(
    "/:id",
    auth,
    getSingleBooking
);

router.put(
    "/cancel/:id",
    auth,
    cancelBooking
);

export default router;