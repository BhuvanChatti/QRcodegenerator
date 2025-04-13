import { QR } from './database.js';
import { formatData, generateQRCode } from './service.js';
import nodemailer from "nodemailer";

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

const generateQR = async (req, res) => {
	try {
		// console.log("Received request:", JSON.stringify(req.body, null, 2));
		const { id, price } = req.body.data;
		const data = req.body.data;
		const email = req.user.email;
		const qrdata = formatData(data);
		// console.log(id,price,data,email,qrdata);
		const QRimg = await generateQRCode(qrdata);
		const qr = await QR.create({ email, ID: id, price, qrdata, QRimg });
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

export default generateQR;