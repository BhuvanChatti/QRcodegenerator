import React, { useContext, useEffect, useState, useCallback } from "react";
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import QRCode from 'qrcode';
import { toast } from 'react-toastify';
import { QRctxt } from "./Refrshcontext.js";

const API = process.env.REACT_APP_API_URL || 'https://qrcodegenerator-zuzx.onrender.com/api';

const QR_TYPES = [
    { id: 'url',     label: 'URL' },
    { id: 'text',    label: 'Text' },
    { id: 'wifi',    label: 'WiFi' },
    { id: 'contact', label: 'Contact' },
    { id: 'payment', label: 'Payment' },
];

const ERROR_LEVELS = ['L', 'M', 'Q', 'H'];

const initialData = {
    url:     { url: '' },
    text:    { text: '' },
    wifi:    { ssid: '', password: '', security: 'WPA2' },
    contact: { firstName: '', lastName: '', phone: '', email: '', company: '' },
    payment: { upi: '', name: '', amount: '' },
};

function getContent(type, data) {
    switch (type) {
        case 'url': return data.url || '';
        case 'text': return data.text || '';
        case 'wifi': {
            if (!data.ssid) return '';
            const sec = data.security === 'Open' ? 'nopass' : 'WPA';
            return `WIFI:T:${sec};S:${data.ssid};P:${data.password || ''};;`;
        }
        case 'contact':
            if (!data.firstName && !data.phone) return '';
            return [
                'BEGIN:VCARD', 'VERSION:3.0',
                `N:${data.lastName};${data.firstName}`,
                `FN:${data.firstName} ${data.lastName}`.trim(),
                data.phone ? `TEL:${data.phone}` : '',
                data.email ? `EMAIL:${data.email}` : '',
                data.company ? `ORG:${data.company}` : '',
                'END:VCARD'
            ].filter(Boolean).join('\n');
        case 'payment': {
            if (!data.upi || !data.amount) return '';
            const pa = /^\d+$/.test(data.upi.trim()) ? `${data.upi.trim()}@ybl` : data.upi.trim();
            const params = new URLSearchParams({ pa, am: data.amount, cu: 'INR' });
            if (data.name) params.set('pn', data.name);
            return `upi://pay?${params.toString()}`;
        }
        default: return '';
    }
}

function TypeForm({ type, data, onChange }) {
    const field = (label, key, inputType = 'text', placeholder = '') => (
        <div key={key}>
            <label className="block text-xs font-medium text-zinc-500 mb-1">{label}</label>
            <input
                type={inputType}
                value={data[key] || ''}
                onChange={e => onChange({ ...data, [key]: e.target.value })}
                placeholder={placeholder}
                className="w-full px-3 py-2 text-sm bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
        </div>
    );

    if (type === 'url') return field('URL', 'url', 'url', 'https://example.com');
    if (type === 'text') return (
        <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1">Text</label>
            <textarea
                value={data.text || ''}
                onChange={e => onChange({ ...data, text: e.target.value })}
                rows={4}
                placeholder="Enter any text..."
                className="w-full px-3 py-2 text-sm bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 resize-none"
            />
        </div>
    );
    if (type === 'wifi') return (
        <div className="space-y-3">
            {field('Network Name (SSID)', 'ssid', 'text', 'MyNetwork')}
            {field('Password', 'password', 'text', 'password')}
            <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1">Security</label>
                <select
                    value={data.security || 'WPA2'}
                    onChange={e => onChange({ ...data, security: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
                >
                    <option value="WPA2">WPA2 / WPA3 (recommended)</option>
                    <option value="WPA">WPA (older routers)</option>
                    <option value="WEP">WEP (legacy)</option>
                    <option value="Open">Open (no password)</option>
                </select>
            </div>
        </div>
    );
    if (type === 'contact') return (
        <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
                {field('First Name', 'firstName', 'text', 'John')}
                {field('Last Name', 'lastName', 'text', 'Doe')}
            </div>
            {field('Phone', 'phone', 'tel', '+91 9876543210')}
            {field('Email', 'email', 'email', 'john@example.com')}
            {field('Company', 'company', 'text', 'Acme Inc.')}
        </div>
    );
    if (type === 'payment') return (
        <div className="space-y-3">
            {field('UPI ID / Phone Number', 'upi', 'text', '9876543210@upi or 9876543210')}
            {field('Payee Name (optional)', 'name', 'text', 'John Doe')}
            {field('Amount (₹)', 'amount', 'number', '0')}
        </div>
    );
    return null;
}

export default function Home() {
    const navigate = useNavigate();
    const { setR } = useContext(QRctxt);

    const [type, setType] = useState('url');
    const [data, setData] = useState(initialData['url']);
    const [config, setConfig] = useState({ fg: '#000000', bg: '#ffffff', size: 300, errorLevel: 'M' });
    const [previewUrl, setPreviewUrl] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!localStorage.getItem('token')) {
            toast.info("Login to generate QR codes");
            navigate('/login');
        }
    }, [navigate]);

    const handleTypeChange = (t) => {
        setType(t);
        setData(initialData[t]);
        setPreviewUrl('');
    };

    const generatePreview = useCallback(async (content, cfg) => {
        if (!content) { setPreviewUrl(''); return; }
        try {
            const url = await QRCode.toDataURL(content, {
                color: { dark: cfg.fg, light: cfg.bg },
                width: cfg.size,
                errorCorrectionLevel: cfg.errorLevel,
                margin: 2
            });
            setPreviewUrl(url);
        } catch {
            setPreviewUrl('');
        }
    }, []);

    useEffect(() => {
        const content = getContent(type, data);
        generatePreview(content, config);
    }, [type, data, config, generatePreview]);

    const handleSave = async () => {
        const content = getContent(type, data);
        if (!content) return toast.error('Fill in the required fields first');
        setSaving(true);
        try {
            await axios.post(`${API}/generate-qr`, { type, data, config }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            toast.success('QR saved and emailed to you');
            setR(prev => !prev);
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    const handleDownload = () => {
        if (!previewUrl) return;
        const a = document.createElement('a');
        a.href = previewUrl;
        a.download = `qr-${type}-${Date.now()}.png`;
        a.click();
    };

    const hasContent = !!getContent(type, data);

    return (
        <div className="min-h-screen bg-zinc-50 flex flex-col">
            <nav className="bg-zinc-900 px-6 py-4 flex items-center justify-between shrink-0">
                <span className="text-white font-semibold text-lg tracking-tight">QR Generator</span>
                <div className="flex items-center gap-3">
                    <Link to="/myqrs" className="text-sm text-zinc-300 hover:text-white transition-colors px-3 py-1.5 rounded-md hover:bg-zinc-800">
                        My QRs
                    </Link>
                    <button
                        onClick={() => { localStorage.removeItem('token'); navigate('/login'); }}
                        className="text-sm text-zinc-300 hover:text-white transition-colors px-3 py-1.5 rounded-md hover:bg-zinc-800"
                    >
                        Logout
                    </button>
                </div>
            </nav>

            <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-8 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                {/* Left — Form */}
                <div className="space-y-6">
                    <div>
                        <h1 className="text-2xl font-bold text-zinc-900">Generate QR Code</h1>
                        <p className="text-sm text-zinc-500 mt-1">Choose a type, fill in the details, customize and save.</p>
                    </div>

                    {/* Type selector */}
                    <div className="flex flex-wrap gap-2">
                        {QR_TYPES.map(t => (
                            <button
                                key={t.id}
                                onClick={() => handleTypeChange(t.id)}
                                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                                    type === t.id
                                        ? 'bg-zinc-900 text-white'
                                        : 'bg-white border border-zinc-200 text-zinc-600 hover:border-zinc-400'
                                }`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>

                    {/* Dynamic form */}
                    <div className="bg-white rounded-xl border border-zinc-200 p-5">
                        <h2 className="text-sm font-semibold text-zinc-700 mb-4">Content</h2>
                        <TypeForm type={type} data={data} onChange={setData} />
                    </div>

                    {/* Customization */}
                    <div className="bg-white rounded-xl border border-zinc-200 p-5">
                        <h2 className="text-sm font-semibold text-zinc-700 mb-4">Customize</h2>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-zinc-500 mb-1.5">Foreground</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="color"
                                            value={config.fg}
                                            onChange={e => setConfig(c => ({ ...c, fg: e.target.value }))}
                                            className="h-9 w-9 rounded-lg border border-zinc-200 cursor-pointer p-0.5"
                                        />
                                        <input
                                            type="text"
                                            value={config.fg}
                                            onChange={e => setConfig(c => ({ ...c, fg: e.target.value }))}
                                            className="flex-1 px-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-lg font-mono"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-zinc-500 mb-1.5">Background</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="color"
                                            value={config.bg}
                                            onChange={e => setConfig(c => ({ ...c, bg: e.target.value }))}
                                            className="h-9 w-9 rounded-lg border border-zinc-200 cursor-pointer p-0.5"
                                        />
                                        <input
                                            type="text"
                                            value={config.bg}
                                            onChange={e => setConfig(c => ({ ...c, bg: e.target.value }))}
                                            className="flex-1 px-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-lg font-mono"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-zinc-500 mb-1.5">
                                    Size — {config.size}px
                                </label>
                                <input
                                    type="range"
                                    min={128}
                                    max={512}
                                    step={8}
                                    value={config.size}
                                    onChange={e => setConfig(c => ({ ...c, size: Number(e.target.value) }))}
                                    className="w-full accent-zinc-900"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-zinc-500 mb-1.5">Error Correction</label>
                                <div className="flex gap-2">
                                    {ERROR_LEVELS.map(l => (
                                        <button
                                            key={l}
                                            onClick={() => setConfig(c => ({ ...c, errorLevel: l }))}
                                            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                                                config.errorLevel === l
                                                    ? 'bg-zinc-900 text-white'
                                                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                                            }`}
                                        >
                                            {l}
                                        </button>
                                    ))}
                                </div>
                                <p className="text-xs text-zinc-400 mt-1">L = 7% · M = 15% · Q = 25% · H = 30% recovery</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right — Preview */}
                <div className="lg:sticky lg:top-8 space-y-4">
                    <div className="bg-white rounded-xl border border-zinc-200 p-6 flex flex-col items-center">
                        <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-4">Live Preview</p>
                        {previewUrl ? (
                            <img
                                src={previewUrl}
                                alt="QR Preview"
                                className="rounded-lg"
                                style={{ width: Math.min(config.size, 280), height: Math.min(config.size, 280) }}
                            />
                        ) : (
                            <div className="w-56 h-56 rounded-lg bg-zinc-50 border-2 border-dashed border-zinc-200 flex items-center justify-center">
                                <p className="text-sm text-zinc-400 text-center px-4">Fill in the fields to see a preview</p>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleDownload}
                        disabled={!hasContent}
                        className="w-full py-2.5 text-sm font-medium rounded-xl border border-zinc-300 text-zinc-700 hover:bg-zinc-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        Download PNG
                    </button>

                    <button
                        onClick={handleSave}
                        disabled={saving || !hasContent}
                        className="w-full py-2.5 text-sm font-semibold rounded-xl bg-zinc-900 text-white hover:bg-zinc-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? 'Saving…' : 'Save & Email to Me'}
                    </button>
                </div>
            </div>
        </div>
    );
}
