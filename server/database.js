import mongoose from "mongoose";
import colors from "colors";

const userSchema = new mongoose.Schema({
	name: String,
	email: String,
	phoneno: String,
	password: String
});

const qrSchema = new mongoose.Schema({
	email: String,
	ID: String,
	price: String,
	qrdata: String,
	QRimg: Buffer
});

export const User = mongoose.model('User', userSchema, 'Users');
export const QR = mongoose.model('QR', qrSchema, 'QRs')

export const conndb = async () => {
	try {
		await mongoose.connect('mongodb+srv://bhuvanchatti579:anits123@node1.1emo21o.mongodb.net/');
		console.log("MongoDB connected successfully!".blue);
	} catch (error) {
		console.error("MongoDB connection error:", error);
	}
};
