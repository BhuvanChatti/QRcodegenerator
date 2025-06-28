import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function Login() {
    const [email, setE] = useState('');
    const [password, setP] = useState('');
    const [loading, setLd] = useState(false);
    const navigate = useNavigate();
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            navigate('/');
        }
    }, [navigate]);
    const handlesubmit = async (e) => {
        e.preventDefault();
        if (loading)
            return
        setLd(true);
        try {
            const res = await axios.post("https://qrcodegenerator-zuzx.onrender.com/api/login", { email, password }, { headers: { "Content-Type": "application/json" }, responseType: 'json' });
            console.log(res);
            toast.success("Login Successfull");
            localStorage.setItem("token", res.data.token);
            navigate('/');
        }
        catch (error) {
            if (error.response && error.response.status === 401) {
                console.log(error.response.data);
                toast.error((error.response.data.message || "Invalid credentials"));
            }
            console.error("Login error:", error);
        }
        finally {
            setLd(false);
        }
    }
    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded-xl shadow-[0_5px_20px_rgba(53,133,165,1)] w-full max-w-md text-center">
                <h1 className="text-2xl font-bold mb-6 text-gray-800">Login</h1>
                <form id="login-form" onSubmit={handlesubmit} className="space-y-4">
                    <input className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" type="email" id="email" placeholder="Email" value={email} onChange={(e) => setE(e.target.value)} required />
                    <input className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" type="password" id="password" placeholder='password' value={password} onChange={e => setP(e.target.value)} required />
                    <button type="submit" className="w-full py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition">Login</button><br />
                    <p className="text-sm text-gray-600">Not registered? <a href="/register" className="text-blue-600 hover:underline">Register here</a></p>
                </form>
            </div>
        </div>
    );
}
export default Login;