import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { JWT_SECRET } from '../middlewares/authMiddleware.js';
import { User } from "../database.js";
import transporter from '../mail.js';

export const registerC = async (req, res) => {
    const errs = validationResult(req);
    if (!errs.isEmpty()) {
        return res.status(400).json({ errors: errs.array().map(e => e.msg) });
    }
    const { name, email, phoneno, password } = req.body;
    try {
        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({ errors: ['Email already registered'] });
        }
        const hash = await bcrypt.hash(password, 12);
        const user = await User.create({ name, email, phoneno, password: hash });

        transporter.sendMail({
            from: 'bhuvanchattiproject@gmail.com',
            to: email,
            subject: 'Welcome to QR Generator',
            html: `<h2>Hi ${name}, you're all set!</h2><p>Start generating QR codes at <a href="https://qrcodegenerator-zuzx.onrender.com">qrcodegenerator-zuzx.onrender.com</a></p>`
        }).catch(err => console.error('Email error:', err.message));

        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        res.status(500).json({ errors: ['Registration failed. Please try again.'] });
    }
};

export const loginC = async (req, res) => {
    const errs = validationResult(req);
    if (!errs.isEmpty()) {
        return res.status(400).json({ errors: errs.array().map(e => e.msg) });
    }
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'No account found with this email' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Incorrect password' });
        }
        const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '1d' });

        transporter.sendMail({
            from: 'bhuvanchattiproject@gmail.com',
            to: email,
            subject: 'New login – QR Generator',
            html: `<p>Hi ${user.name}, you logged in at ${new Date().toLocaleString()}. If this wasn't you, change your password immediately.</p>`
        }).catch(err => console.error('Email error:', err.message));

        res.status(200).json({ message: 'Login successful', token });
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
