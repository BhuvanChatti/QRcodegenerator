import express from 'express';
import { body, ExpressValidator } from 'express-validator';
import { loginC, registerC } from '../controllers/authController.js';
const router = express.Router();
router.post('/register',
	[
		body('name').notEmpty().withMessage('The name is required'),
		body('email').notEmpty().withMessage('The email is required').bail().isEmail().withMessage('This should be an email'),
		body('phoneno').notEmpty().withMessage('The phone.no is required').bail().isLength({ min: 10, max: 10 }).withMessage('Phone number should be 10 digits only'),
		body('password').notEmpty().withMessage('The password is required').bail().isLength({ min: 6, max: 15 }).withMessage('The password must be 6 to 15 charecters')
	], registerC);
router.post("/login",
	[
		body('email').notEmpty().withMessage('Email is required').bail().isEmail().withMessage('Enter a valid email'),
		body('password').notEmpty().withMessage('Password is required')
	], loginC);
export default router;