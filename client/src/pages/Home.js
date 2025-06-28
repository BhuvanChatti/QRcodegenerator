import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { QRctxt } from "./Refrshcontext.js";
import MyQRs from "./QR.js";

function Home() {
    const [id, setid] = useState('');
    const [amount, setamount] = useState('');
    const [qrUrl, setqrUrl] = useState(null);
    const navigate = useNavigate();
    const { setR } = useContext(QRctxt);
    const [menu, setM] = useState(false);
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            toast.info("Login to Generate QR's");
            navigate('/login');
        }
    }, [navigate]);
    const handleLogout = () => {
        localStorage.removeItem("token");
        toast.success("Logout successfull");
        navigate("/login");
    };
    const handlesubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
        }
        try {
            const res = await axios.post("https://qrcodegenerator-zuzx.onrender.com/api/generate-qr", { data: { id, amount } },
                {
                    headers:
                        { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    responseType: 'blob'
                });
            const url = URL.createObjectURL(res.data);
            toast.success("QR Generated Successfully");
            setqrUrl(url);
            setR(prev => !prev);
        }
        catch (error) {
            console.error('Error generating QR code:', error);
            toast.error("Please login to generate QR codes");
            navigate('/login');
        }
    }
    return (
        <div>
            <nav className="bg-gray-800 p-4 text-white flex justify-between items-center">
                <div className="text-xl font-bold">QR Code Generator</div>
                <button onClick={handleLogout} className="bg-trasparent hover:bg-blue-600 px-4 py-2 rounded-lg text-white border border-blue-600">Logout</button>
            </nav>

            <div className="mt-4 ml-4">
                <button onClick={() => setM(true)} className="bg-black hover:bg-white px-4 py-2 rounded-lg text-white hover:text-black border border-white hover:border-black">My QRs</button>
            </div>

            <div className="flex">
                {menu && (
                    <div className="fixed top-20 left-0 w-96 h-[calc(100vh-64px)] bg-white shadow-xl z-50 border-l border-gray-300 overflow-y-auto">
                        <div className="p-4 relative">
                            <div className="flex items-center justify-between mb-4">
                                <button onClick={() => setM(false)} className="text-xl font-bold text-gray-600">&lt;</button>
                                <h2 className="text-xl font-bold text-center flex-1">My QRs</h2>
                            </div>
                            <MyQRs />
                        </div>
                    </div>
                )}
                <div className="flex-1 p-8 overflow-y-auto">
                    <div className="max-w-xl mx-auto mt-24 bg-white p-8 rounded-lg shadow-md">
                        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">QR Code Generator</h1>
                        <form onSubmit={handlesubmit} className="space-y-4">
                            <div>
                                <label htmlFor="qr-id" className="block text-gray-700 font-medium mb-1">ID:</label>
                                <input type="text" id="qr-id" value={id} onChange={(e) => setid(e.target.value)} required className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter ID" />
                            </div>
                            <div>
                                <label htmlFor="qr-amount" className="block text-gray-700 font-medium mb-1">amount:</label>
                                <input type="number" id="qr-amount" min="0" value={amount} onChange={(e) => setamount(e.target.value)} required className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter amount" />
                            </div>
                            <button type="submit" className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-md font-semibold">Generate QR Code</button>
                        </form>
                        {qrUrl && <div className="mt-6 text-center"><img src={qrUrl} alt="Generated QR" className="inline-block border-4 border-blue-500 rounded-lg shadow" /></div>}
                    </div>
                </div>
            </div>
        </div>
    );
}
export default Home;