"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
const jwt_1 = require("../utils/jwt");
function requireAuth(roles) {
    return (req, res, next) => {
        const authHeader = req.headers.authorization || '';
        const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : undefined;
        if (!token)
            return res.status(401).json({ message: 'Unauthorized' });
        try {
            const payload = (0, jwt_1.verifyAccessToken)(token);
            if (roles && !roles.includes(payload.role)) {
                return res.status(403).json({ message: 'Forbidden' });
            }
            req.user = payload;
            next();
        }
        catch {
            return res.status(401).json({ message: 'Invalid token' });
        }
    };
}
