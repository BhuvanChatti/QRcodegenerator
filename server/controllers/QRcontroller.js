import { QR } from '../database.js';
import { formatContent, getLabelForType, generateQRCode } from '../service.js';
import transporter from '../mail.js';

export const generateQR = async (req, res) => {
    try {
        const { type = 'payment', data = {}, config = {} } = req.body;
        const email = req.user.email;

        const content = formatContent(type, data);
        if (!content) return res.status(400).json({ error: 'No content to encode' });

        const label = getLabelForType(type, data);
        const QRimg = await generateQRCode(content, config);

        const qrDoc = { email, type, label, qrdata: content, QRimg, config };
        if (type === 'payment') { qrDoc.ID = data.id; qrDoc.amount = data.amount; }

        await QR.create(qrDoc);

        transporter.sendMail({
            from: 'bhuvanchattiproject@gmail.com',
            to: email,
            subject: `QR code generated – ${label}`,
            html: `<h2>QR Code Generated</h2><p>Type: ${type}</p><p>Generated at: ${new Date().toLocaleString()}</p>`,
            attachments: [{ filename: 'qrcode.png', content: QRimg, cid: 'qrcodeimage' }]
        }).catch(err => console.error('Email error:', err.message));

        res.type('image/png').send(QRimg);
    } catch (err) {
        console.error('Generate QR error:', err);
        res.status(500).json({ error: 'Failed to generate QR code' });
    }
};

export const MyQRs = async (req, res) => {
    try {
        const email = req.user.email;
        const qrs = await QR.find({ email }).sort({ createdAt: -1 });
        res.status(200).json({ qrs });
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const deleteQR = async (req, res) => {
    try {
        const email = req.user.email;
        const qr = await QR.findOneAndDelete({ _id: req.params.id, email });
        if (!qr) return res.status(404).json({ message: 'Not found' });
        res.status(200).json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
