export const isAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized"
        });
    }

    if (req.user.role !== "admin") {
        return res.status(403).json({
            success: false,
            message: "Access Denied"
        });
    }

    next();
};

export const isInstructor = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized"
        });
    }

    if (req.user.role !== "instructor") {
        return res.status(403).json({
            success: false,
            message: "Access Denied"
        });
    }

    next();
};

export const isUser = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized"
        });
    }

    if (req.user.role !== "user") {
        return res.status(403).json({
            success: false,
            message: "Access Denied"
        });
    }

    next();
};

export const isInstructorOrAdmin = (req, res, next) => {
    console.log("Logged-in user:", req.user);
    console.log("User role:", req.user?.role);

    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized",
        });
    }

    if (!["instructor", "admin"].includes(req.user.role)) {
        return res.status(403).json({
            success: false,
            message: `Access denied. Role received: ${req.user.role}`,
        });
    }

    next();
};

