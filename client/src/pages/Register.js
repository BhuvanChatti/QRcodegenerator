import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";

const API = process.env.REACT_APP_API_URL || 'https://qrcodegenerator-zuzx.onrender.com/api';

export default function Register() {
    const [form, setForm] = useState({ name: '', email: '', phoneno: '', password: '' });
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (localStorage.getItem('token')) navigate('/');
    }, [navigate]);

    const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (loading) return;
        setLoading(true);
        try {
            await axios.post(`${API}/register`, form);
            toast.success('Registered! Please sign in.');
            setTimeout(() => navigate('/login'), 1200);
        } catch (err) {
            const errors = err.response?.data?.errors;
            toast.error(Array.isArray(errors) ? errors.join(', ') : 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const field = (label, key, type = 'text', placeholder = '') => (
        <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1.5">{label}</label>
            <input
                type={type}
                value={form[key]}
                onChange={set(key)}
                placeholder={placeholder}
                className="w-full px-3 py-2.5 text-sm bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
                required
            />
        </div>
    );

    return (
        <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-4">
            <div className="w-full max-w-sm">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-zinc-900 rounded-xl mb-4">
                        <img src="/logo-white.svg" alt="logo" className="w-6 h-6" />
                    </div>
                    <h1 className="text-2xl font-bold text-zinc-900">Create Account</h1>
                    <p className="text-sm text-zinc-500 mt-1">Start generating QR codes</p>
                </div>

                <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {field('Name', 'name', 'text', 'John Doe')}
                        {field('Email', 'email', 'email', 'you@example.com')}
                        {field('Phone Number', 'phoneno', 'tel', '+91 9876543210')}
                        <div>
                            <label className="block text-xs font-medium text-zinc-500 mb-1.5">Password</label>
                            <div className="relative">
                                <input
                                    type={showPw ? 'text' : 'password'}
                                    value={form.password}
                                    onChange={set('password')}
                                    placeholder="Min. 6 characters"
                                    className="w-full px-3 py-2.5 text-sm bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 pr-14"
                                    required
                                    minLength={6}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPw(p => !p)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-zinc-600"
                                >
                                    {showPw ? 'Hide' : 'Show'}
                                </button>
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2.5 bg-zinc-900 text-white text-sm font-semibold rounded-lg hover:bg-zinc-700 transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Creating account…' : 'Create Account'}
                        </button>
                    </form>
                    <p className="text-center text-sm text-zinc-500 mt-4">
                        Already have an account?{' '}
                        <Link to="/login" className="text-zinc-900 font-medium hover:underline">Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
