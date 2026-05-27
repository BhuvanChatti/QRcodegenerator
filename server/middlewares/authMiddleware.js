import jwt from 'jsonwebtoken';

export const JWT_SECRET = process.env.JWT_SECRET || 'qrgen_secret_change_in_prod';

export const authToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Access denied: no token provided' });
    try {
        req.user = jwt.verify(token, JWT_SECRET);
        next();
    } catch (err) {
        res.status(403).json({ message: 'Invalid or expired token' });
    }
};
