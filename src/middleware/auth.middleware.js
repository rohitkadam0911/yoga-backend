import jwt from "jsonwebtoken";

const extractToken = (req, ...cookieNames) => {
    // 1. Try specified cookies
    for (const name of cookieNames) {
        if (req.cookies?.[name]) {
            return req.cookies[name];
        }
    }

    // 2. Try Authorization header (Bearer token)
    if (req.headers.authorization) {
        const parts = req.headers.authorization.split(" ");
        if (parts.length === 2 && parts[0] === "Bearer") {
            return parts[1];
        }
        return req.headers.authorization;
    }

    return null;
};

export const auth = async (req, res, next) => {
    try {
        const token = extractToken(req, "token");

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

        req.user = decoded;

        next();

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid Token"
        });
    }
};

export const adminAuth = async (req, res, next) => {
    try {
        const token = extractToken(req, "adminToken", "token");

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Admin authentication required"
            });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET_KEY
        );

        if (decoded.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Admin access denied"
            });
        }

        req.user = decoded;

        next();

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid admin token"
        });
    }
};

export const classAuth = async (req, res, next) => {
    try {
        const token = extractToken(req, "adminToken", "token");

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET_KEY
        );

        req.user = decoded;

        if (!["admin", "instructor"].includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "Only instructors and admins can perform this action",
            });
        }

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid token",
        });
    }
};