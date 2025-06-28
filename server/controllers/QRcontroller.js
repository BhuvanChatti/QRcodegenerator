import { QR } from '../database.js';
import { formatData, generateQRCode } from '../service.js';
import nodemailer from "nodemailer";
import transporter from '../mail.js';

export const generateQR = async (req, res) => {
	try {
		// console.log("Received request:", JSON.stringify(req.body, null, 2));
		const { id, amount } = req.body.data;
		const data = req.body.data;
		const email = req.user.email;
		const qrdata = formatData(data);
		// console.log(id,amount,data,email,qrdata);
		const QRimg = await generateQRCode(qrdata);
		const qr = await QR.create({ email, ID: id, amount, qrdata, QRimg });
		res.setHeader('Content-Disposition', 'attachment; filename=qrcode.png');
		const date = new Date();
		const ctime = date.toLocaleString();
		const mail = await transporter.sendMail({
			from: '<bhuvanchatti579@gmail.com>',
			to: email,
			subject: "Successfully genrated a QR code on your account",
			html: `
			<h1>QR code generated at: ${ctime}</h1>
			<h2>Here is your QR Code:</h2>
			<img src="cid:qrcodeimage"/>`,
			attachments: [{
				filename: 'qrcode.png',
				content: QRimg,
				cid: 'qrcodeimage'
			}]
		});
		res.type('image/png').send(QRimg);
	} catch (err) {
		res.status(500).send({ error: 'Internal Server Error' });
	}
};

export const MyQRs = async (req, res) => {
	try {
		// console.log("Received request:", JSON.stringify(req.body, null, 2));
		const email = req.user.email;
		const qrs = await QR.find({ email: email }).sort({ _id: -1 });
		res.status(200).send({ qrs: qrs });
	} catch (err) {
		res.status(500).send({ error: 'Internal Server Error' });
	}
};