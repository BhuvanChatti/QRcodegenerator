import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function Register() {
    const [name, setN] = useState('');
    const [email, setE] = useState('');
    const [password, setP] = useState('');
    const [phoneno, setPh] = useState('');
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
            const res = await axios.post("https://qrcodegenerator-zuzx.onrender.com/api/register", { name, email, password, phoneno }, { headers: { "Content-Type": "application/json" }, responseType: 'json' });
            toast.success("Registration Successfull!! Continue to login page");
            setTimeout(() => navigate('/Login'), 1500);
        }
        catch (error) {
            console.log(error.response.data.errors);
            toast.error(`${error.response.data.errors.join(', ')}`);
        }
        finally {
            setLd(false);
        }
    }
    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded-xl shadow-[0_5px_20px_rgba(53,133,165,1)] w-full max-w-md text-center">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Register</h2>
                <form id="registerForm" onSubmit={handlesubmit} className="space-y-4">
                    <input className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" type="text" name="name" value={name} onChange={(e) => setN(e.target.value)} placeholder="Name" required />
                    <input className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" type="email" name="email" value={email} onChange={(e) => setE(e.target.value)} placeholder="Email" required />
                    <input className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" type="text" name="phoneno" value={phoneno} onChange={(e) => setPh(e.target.value)} placeholder="Phone Number" required />
                    <input className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" type="password" name="password" value={password} onChange={(e) => setP(e.target.value)} placeholder="Password" required />
                    <button type="submit" className="w-full py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition">Register</button>
                    <p className="text-sm text-gray-600">Already have an account? <a href="/login" className="text-blue-600 hover:underline">Login here</a></p>
                </form>
            </div>
        </div>
    )
}
export default Register;