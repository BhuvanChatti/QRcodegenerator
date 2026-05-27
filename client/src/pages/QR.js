import { useContext, useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from 'axios';
import { toast } from 'react-toastify';
import { QRctxt } from './Refrshcontext';

const API = process.env.REACT_APP_API_URL || 'https://qrcodegenerator-zuzx.onrender.com/api';

const typeColors = {
    url:     'bg-blue-50 text-blue-700',
    text:    'bg-zinc-100 text-zinc-700',
    wifi:    'bg-purple-50 text-purple-700',
    contact: 'bg-green-50 text-green-700',
    payment: 'bg-amber-50 text-amber-700',
};

function QRCard({ qr, onDelete }) {
    const imgUrl = URL.createObjectURL(new Blob([new Uint8Array(qr.QRimg.data)], { type: 'image/png' }));

    const handleDownload = () => {
        const a = document.createElement('a');
        a.href = imgUrl;
        a.download = `qr-${qr.label || qr._id}.png`;
        a.click();
    };

    return (
        <div className="bg-white border border-zinc-200 rounded-xl p-4 hover:border-zinc-400 transition-colors flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full capitalize ${typeColors[qr.type] || 'bg-zinc-100 text-zinc-700'}`}>
                    {qr.type || 'payment'}
                </span>
                <span className="text-xs text-zinc-400">
                    {qr.createdAt ? new Date(qr.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                </span>
            </div>

            <div className="flex items-center justify-center bg-zinc-50 rounded-lg p-3">
                <img src={imgUrl} alt="QR" className="w-32 h-32 object-contain" />
            </div>

            <p className="text-sm font-medium text-zinc-800 truncate" title={qr.label}>
                {qr.label || (qr.ID ? `₹${qr.amount} – ${qr.ID}` : 'QR Code')}
            </p>

            <div className="flex gap-2 mt-auto">
                <button
                    onClick={handleDownload}
                    className="flex-1 py-1.5 text-xs font-medium rounded-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-50 transition-colors"
                >
                    Download
                </button>
                <button
                    onClick={() => onDelete(qr._id)}
                    className="flex-1 py-1.5 text-xs font-medium rounded-lg border border-red-100 text-red-600 hover:bg-red-50 transition-colors"
                >
                    Delete
                </button>
            </div>
        </div>
    );
}

export default function MyQRs() {
    const navigate = useNavigate();
    const [qrs, setQrs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const { Refresh } = useContext(QRctxt);

    useEffect(() => {
        if (!localStorage.getItem('token')) { navigate('/login'); return; }
        const fetch = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`${API}/myqrs`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                setQrs(res.data.qrs || []);
            } catch {
                toast.error('Failed to load QR codes');
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [Refresh, navigate]);

    const handleDelete = async (id) => {
        try {
            await axios.delete(`${API}/qr/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setQrs(prev => prev.filter(q => q._id !== id));
            toast.success('Deleted');
        } catch {
            toast.error('Failed to delete');
        }
    };

    const filtered = qrs.filter(q =>
        !search ||
        (q.label || '').toLowerCase().includes(search.toLowerCase()) ||
        (q.type || '').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-zinc-50 flex flex-col">
            <nav className="bg-zinc-900 px-6 py-4 flex items-center justify-between shrink-0">
                <Link to="/" className="flex items-center gap-2 text-zinc-300 hover:text-white transition-colors text-sm">
                    ← Back
                </Link>
                <div className="flex items-center gap-2.5">
                    <div className="flex items-center justify-center w-8 h-8 bg-white rounded-lg">
                        <img src="/logo.svg" alt="logo" className="w-4 h-4" />
                    </div>
                    <span className="text-white font-semibold text-lg tracking-tight">My QR Codes</span>
                </div>
                <span className="text-zinc-500 text-sm">{qrs.length} total</span>
            </nav>

            <div className="max-w-5xl mx-auto w-full px-4 py-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-zinc-900">Your QR Codes</h1>
                        <p className="text-sm text-zinc-500 mt-1">All codes you've generated and saved</p>
                    </div>
                    <input
                        type="text"
                        placeholder="Search…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="px-4 py-2 text-sm bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 w-52"
                    />
                </div>

                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {Array(8).fill(null).map((_, i) => (
                            <div key={i} className="h-56 bg-zinc-200 rounded-xl animate-pulse" />
                        ))}
                    </div>
                ) : filtered.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {filtered.map(qr => (
                            <QRCard key={qr._id} qr={qr} onDelete={handleDelete} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <p className="text-zinc-400 text-sm">{search ? 'No results found.' : 'No QR codes yet.'}</p>
                        {!search && (
                            <Link to="/" className="mt-3 inline-block text-sm font-medium text-zinc-900 hover:underline">
                                Generate your first QR →
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
