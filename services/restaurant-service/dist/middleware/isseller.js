"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isseller = void 0;
const isseller = (req, res, next) => {
    const user = req.user;
    if (!user) {
        res.status(401).json({ error: 'Unauthorized: No user information found' });
        return;
    }
    if (user.role != 'seller') {
        res.status(403).json({ error: 'Forbidden: User is not a seller' });
        return;
    }
    next();
};
exports.isseller = isseller;
