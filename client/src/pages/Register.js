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
            const res = await axios.post("http://localhost:3000/api/register", { name, email, password, phoneno }, { headers: { "Content-Type": "application/json" }, responseType: 'json' });
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
        <div className="center-page">
            <div className="container register-container text-center">
                <h2 class="register-title">Register</h2>
                <form id="registerForm" onSubmit={handlesubmit}>
                    <input className="form-control" type="text" name="name" value={name} onChange={(e) => setN(e.target.value)} placeholder="Name" required />
                    <input className="form-control" type="email" name="email" value={email} onChange={(e) => setE(e.target.value)} placeholder="Email" required />
                    <input className="form-control" type="text" name="phoneno" value={phoneno} onChange={(e) => setPh(e.target.value)} placeholder="Phone Number" required />
                    <input className="form-control" type="password" name="password" value={password} onChange={(e) => setP(e.target.value)} placeholder="Password" required />
                    <button type="submit" className="btn btn-danger">Register</button>
                    <p>Already have an account? <a href="/login">Login here</a></p>
                </form>
            </div>
        </div>
    )
}
export default Register;