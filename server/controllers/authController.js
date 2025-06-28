import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../middlewares/authMiddleware.js';
import { User } from "../database.js";
import transporter from '../mail.js';

export const registerC = async (req, res) => {
    const errs = validationResult(req);
    if (!errs.isEmpty()) {
        const errarr = errs.array().map(err => err.msg);
        return res.status(400).json({ errors: errarr });
    }
    const { name, email, phoneno, password } = req.body;
    try {
        const echeck = await User.findOne({ email: email });
        if (echeck) {
            return res.status(400).json({ errors: ['User already registered with this email'] });
        }
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
        res.status(400).send('Error creating user: ' + error.message);
    }
};

export const loginC = async (req, res) => {
    const errs = validationResult(req);
    if (!errs.isEmpty()) {
        const errarr = errs.array().map(err => err.msg);
        return res.status(400).json({ errors: errarr });
    }
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'User not registered. Register to Login' });
        }
        if (user.password !== password) {
            return res.status(401).json({ message: 'Incorrect Password. Try Again!' });
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