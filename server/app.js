import express from 'express';
import path from "path";
import bodyParser from 'body-parser';
import cors from 'cors';
import { conndb, User } from './database.js';
import router from './routes.js';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from './JWT.js';
import colors from "colors";
import nodemailer from "nodemailer";
import { fileURLToPath } from 'url';

const app = express();
const port = process.env.PORT || 3000;

conndb();
const transporter = nodemailer.createTransport({
	service: "Gmail",
	auth: {
		host: "smtp.gmail.com",
		port: 587,
		secure: false,
		user: "bhuvanchatti579@gmail.com",
		pass: "dfgp nbue aekc yizo",
	},
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, 'client')));
app.get('*', (req, res) => {
	res.sendFile(path.join(__dirname, 'client', 'index.html'));
});
app.use(bodyParser.json());
app.use(cors());
app.use(router);
app.post("/register", [
	body('name').notEmpty().withMessage('The name is required'),
	body('email').notEmpty().withMessage('The email is required').bail().isEmail().withMessage('This should be an email'),
	body('phoneno').notEmpty().withMessage('The phone.no is required').bail().isLength({ min: 10, max: 10 }).withMessage('Phone number should be 10 digits only'),
	body('password').notEmpty().withMessage('The password is required').bail().isLength({ min: 6, max: 15 }).withMessage('The password must be 6 to 15 charecters')
], async (req, res) => {
	const errs = validationResult(req);
	if (!errs.isEmpty()) {
		const errarr = errs.array().map(err => err.msg);
		return res.status(400).json({ errors: errarr });
	}
	const { name, email, phoneno, password } = req.body;
	try {
		const user = await User.create({ name, email, phoneno, password });
		const date = new Date();
		const ctime = date.toLocaleString();
		const mail = await transporter.sendMail({
			from: '<bhuvanchatti579@gmail.com>',
			to: user.email,
			subject: "Successfully registered at Qr Gen",
			html: `<h2>Registration successful on our site at <strong>${ctime}</strong>.</p>
				<h2>Login with your credentials at: 
					<a href="http://127.0.0.1:5500/Node%20proj/qr-code-generator/client/index.html" target="_blank">Click Here to login</a>
				</h2>`,
		});
		res.status(201).json({ message: "User created successfully", user });
	} catch (error) {
		res.status(500).send('Error creating user: ' + error.message);
	}
});

app.post("/login",
	[
		body('email').notEmpty().withMessage('Email is required').bail().isEmail().withMessage('Enter a valid email'),
		body('password').notEmpty().withMessage('Password is required')
	],
	async (req, res) => {
		const errs = validationResult(req);
		if (!errs.isEmpty()) {
			const errarr = errs.array().map(err => err.msg);
			return res.status(400).json({ errors: errarr });
		}
		const { email, password } = req.body;
		try {
			const user = await User.findOne({ email });
			if (!user || user.password !== password) {
				return res.status(401).json({ message: 'Invalid email or password' });
			}
			const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '1d' });
			const date = new Date();
			const ctime = date.toLocaleString();
			const mail = await transporter.sendMail({
				from: '<bhuvanchatti579@gmail.com>',
				to: email,
				subject: "Logged in to Qr Gen",
				html: `<h1>You've loggged in to the site at ${ctime}</h1>
				<h2>genrate superfast QR codes: <a href="http://127.0.0.1:5500/Node%20proj/qr-code-generator/client/index.html">Here</a><h2>`,
			});
			res.status(200).json({ message: 'Login successful', token });
		}
		catch (err) {
			console.log(err);
			res.status(500).json({ error: 'Internal Server Error' });
		}
	}
);

app.listen(port, () => {
	console.log(`Server listening on port ${port}`.magenta);
});
