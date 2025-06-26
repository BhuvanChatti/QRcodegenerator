import express from 'express';
import generateQR from './controller.js';
import { authenticateToken } from './JWT.js';

const router = express.Router();

router.post('/api/generate-qr', authenticateToken, generateQR);

export default router;