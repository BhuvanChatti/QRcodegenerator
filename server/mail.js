import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
	service: "Gmail",
	auth: {
		host: "smtp.gmail.com",
		port: 587,
		secure: false,
		user: "bhuvanchatti579@gmail.com",
		pass: "ikml kxgu yyzw mquz",
	},
});

export default transporter;