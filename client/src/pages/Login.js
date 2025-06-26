import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function Login() {
    const [email, setE] = useState('');
    const [password, setP] = useState('');
    const navigate = useNavigate();
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            navigate('/');
        }
    }, [navigate]);
    const handlesubmit = async (e) => {
        e.preventDefault();
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
    }
    return (
        <div className="center-page">
            <div className="container login-container text-center">
                <h1>Login</h1>
                <form id="login-form" onSubmit={handlesubmit}>
                    <input className="form-control" type="email" id="email" placeholder="Email" value={email} onChange={(e) => setE(e.target.value)} required />
                    <input className="form-control" type="password" id="password" placeholder='password' value={password} onChange={e => setP(e.target.value)} required />
                    <button type="submit" className="btn btn-danger">Login</button><br />
                    <p>Not registered? <a href="/register">Register here</a></p>
                </form>
            </div>
        </div>
    );
}
export default Login;