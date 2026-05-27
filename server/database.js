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
	type: { type: String, default: 'payment' },
	label: String,
	ID: String,
	amount: String,
	qrdata: String,
	QRimg: Buffer,
	config: {
		fg: { type: String, default: '#000000' },
		bg: { type: String, default: '#ffffff' },
		size: { type: Number, default: 300 }
	}
}, { timestamps: true });

export const User = mongoose.model('User', userSchema, 'Users');
export const QR = mongoose.model('QR', qrSchema, 'QRs')

export const conndb = async () => {
	try {
		const uri = process.env.MONGO_URL || 'mongodb+srv://bhuvanchatti579:anits123@node1.1emo21o.mongodb.net/';
		await mongoose.connect(uri);
		console.log("MongoDB connected successfully!".blue);
	} catch (error) {
		console.error("MongoDB connection error:", error);
	}
};
