import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Home() {
    const [id, setid] = useState('');
    const [price, setprice] = useState('');
    const [qrUrl, setqrUrl] = useState(null);
    const navigate = useNavigate();
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
            const res = await axios.post("http://localhost:3000/api/generate-qr", { data: { id, price } },
                {
                    headers:
                        { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    responseType: 'blob'
                });
            const url = URL.createObjectURL(res.data);
            toast.success("QR Generated Successfully");
            setqrUrl(url);
        }
        catch (error) {
            console.error('Error generating QR code:', error);
            toast.error("Please login to generate QR codes");
            navigate('/login');
        }
    }
    return (
        <div>
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
                <a className="navbar-brand" href="#">QR Code Generator</a>
                <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
                    <ul className="navbar-nav">
                        <li className="nav-item">
                            <button onClick={handleLogout} className="btn btn-link nav-link text-white">Logout</button>
                        </li>
                    </ul>
                </div>
            </nav>

            <div className="container home-container">
                <h1 className="home-title">QR Code Generator</h1>
                <form id="qr-form" onSubmit={handlesubmit}>
                    <div className="form-group">
                        <label htmlFor="qr-id">ID:</label>
                        <input type="text" className="form-control" id="qr-id" placeholder="Enter ID" value={id} onChange={(e) => setid(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="qr-price">Price:</label>
                        <input type="number" min="0" className="form-control" id="qr-price" placeholder="Enter Price" value={price} onChange={(e) => setprice(e.target.value)} required />
                    </div>
                    <button type="submit" className="btn btn-danger d-block mx-auto">Generate QR Code</button>
                </form>

                {qrUrl && <div id="qr-result" className="mt-4">
                    <img src={qrUrl}></img>
                </div>}
            </div>
        </div>
    );
}
export default Home;