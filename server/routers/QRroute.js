import express from 'express';
import { generateQR, MyQRs, deleteQR } from '../controllers/QRcontroller.js';
import { authToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/generate-qr', authToken, generateQR);
router.get('/myqrs', authToken, MyQRs);
router.delete('/qr/:id', authToken, deleteQR);

export default router;
