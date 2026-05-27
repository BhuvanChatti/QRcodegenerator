import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: process.env.EMAIL_USER || "bhuvanchattiproject@gmail.com",
        pass: process.env.EMAIL_PASS || "shhd honu hhvm bwmd",
    },
});

export default transporter;
