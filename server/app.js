import express from 'express';
import path from "path";
import bodyParser from 'body-parser';
import cors from 'cors';
import { conndb, User } from './database.js';
import qrRouter from './routers/QRroute.js';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from './middlewares/authMiddleware.js';
import { fileURLToPath } from 'url';
import transporter from './mail.js';
import authRouter from './routers/auth.js';

const app = express();
const port = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

conndb();

app.use(bodyParser.json());
app.use(cors());
app.use("/api", qrRouter);
app.use("/api", authRouter);
app.use(express.static(path.join(__dirname, "../client/build")));
app.use('*', (req, res) => {
	res.sendFile(path.join(__dirname, "../client/build", "index.html"));
});

app.listen(port, () => {
	console.log(`Server listening on port ${port}`.magenta);
});