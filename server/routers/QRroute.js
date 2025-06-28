import express from 'express';
import { generateQR, MyQRs } from '../controllers/QRcontroller.js';
import { authToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/generate-qr', authToken, generateQR);
router.get('/myqrs', authToken, MyQRs);
export default router;