export const isAdmin = (req, res, next) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({
            success: false,
            message: "Access Denied"
        });
    }
    next();
};

export const isInstructor = (req, res, next) => {
    if (req.user.role !== "instructor") {
        return res.status(403).json({
            success: false,
            message: "Access Denied"
        });
    }
    next();
};

export const isUser = (req, res, next) =>{
    if(req.user.role !== "user") {
        return res.status(403).json({
            success: false,
            message: "Access Denied"
        });
    }
    next();
};

export const isInstructorOrAdmin = (req, res, next) => {
    try {

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        if (
            req.user.role !== "instructor" &&
            req.user.role !== "admin"
        ) {
            return res.status(403).json({
                success: false,
                message: "Only instructors and admins can perform this action"
            });
        }

        next();

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};