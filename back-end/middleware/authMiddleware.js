import jwt from "jsonwebtoken";

export const AuthMiddleWare = (req, res, next) => {
    try {

        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                status: false,
                message: "Token Not Available"
            });
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(token, process.env.JSON_WEB_TOKEN);

        // decoded = { id, email, role }
        req.user = decoded;

        next();

    } catch (error) {
        return res.status(401).json({
            status: false,
            message: "Invalid Token"
        });
    }
};

// use this AFTER AuthMiddleWare, on routes that only admins should access
export const AdminOnly = (req, res, next) => {
    if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({
            status: false,
            message: "Admin access only",
        });
    }
    next();
};
