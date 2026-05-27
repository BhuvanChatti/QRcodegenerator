import { toBuffer } from 'qrcode';

export function formatContent(type, data) {
    switch (type) {
        case 'url':
            return data.url || '';
        case 'text':
            return data.text || '';
        case 'wifi': {
            const sec = data.security === 'Open' ? 'nopass' : 'WPA';
            return `WIFI:T:${sec};S:${data.ssid || ''};P:${data.password || ''};;`;
        }
        case 'contact':
            return [
                'BEGIN:VCARD',
                'VERSION:3.0',
                `N:${data.lastName || ''};${data.firstName || ''}`,
                `FN:${data.firstName || ''} ${data.lastName || ''}`.trim(),
                data.phone ? `TEL:${data.phone}` : '',
                data.email ? `EMAIL:${data.email}` : '',
                data.company ? `ORG:${data.company}` : '',
                'END:VCARD'
            ].filter(Boolean).join('\n');
        case 'payment': {
            const raw = (data.upi || '').trim();
            const pa = /^\d+$/.test(raw) ? `${raw}@ybl` : raw;
            const params = new URLSearchParams({ pa, am: data.amount || '', cu: 'INR' });
            if (data.name) params.set('pn', data.name);
            return `upi://pay?${params.toString()}`;
        }
        default:
            return data.text || '';
    }
}

export function getLabelForType(type, data) {
    switch (type) {
        case 'url': return (data.url || 'URL').slice(0, 40);
        case 'text': return (data.text || 'Text').slice(0, 40);
        case 'wifi': return data.ssid || 'WiFi Network';
        case 'contact': return `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'Contact';
        case 'payment': return `₹${data.amount} → ${data.upi || data.name || 'Payment'}`;
        default: return 'QR Code';
    }
}

export async function generateQRCode(text, config = {}) {
    return toBuffer(text, {
        errorCorrectionLevel: config.errorLevel || 'M',
        type: 'image/png',
        margin: 2,
        width: config.size || 300,
        color: {
            dark: config.fg || '#000000',
            light: config.bg || '#ffffff'
        }
    });
}
