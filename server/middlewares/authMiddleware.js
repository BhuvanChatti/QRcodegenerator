import jwt from 'jsonwebtoken';

export const JWT_SECRET = "anits";

export const authToken = (req, res, next) => {
	const authHeader = req.headers['authorization'];
	const token = authHeader && authHeader.split(' ')[1];

	if (!token) return res.status(401).json({ message: 'Access Denied: No Token Provided' });

	try {
		const verified = jwt.verify(token, JWT_SECRET);
		req.user = verified;
		next();
	} catch (err) {
		res.status(403).json({ message: 'Invalid or expired token' });
	}
};
