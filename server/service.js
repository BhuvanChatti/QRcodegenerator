import { toBuffer } from 'qrcode';

export function formatData(data) {
	const qrCodeText = `Product ID: ${data.id}, Price: ₹${data.price}`;
	return qrCodeText;
}

export async function generateQRCode(qrCodeText) {
	const options = {
		errorCorrectionLevel: 'M',
		type: 'image/png',
		margin: 1
	};
	const qrCodeBuffer = await toBuffer(qrCodeText, options);
	return qrCodeBuffer;
}