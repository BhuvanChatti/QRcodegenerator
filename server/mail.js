import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
	service: "Gmail",
	auth: {
		host: "smtp.gmail.com",
		port: 587,
		secure: false,
		user: "bhuvanchattiproject@gmail.com",
		pass: "shhd honu hhvm bwmd",
	},
});

export default transporter;
