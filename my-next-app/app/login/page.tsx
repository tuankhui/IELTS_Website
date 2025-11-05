"use client";

import React, { useState } from 'react';
import '../styles/Auth.css';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import Footer from '../components/Footer';
import config from '../config';
import { motion } from 'framer-motion';
import { Container, TextField, Button, Typography, Paper, CircularProgress } from '@mui/material';


const buttonVariants = {
    hover: {
        scale: 1.1,
        transition: {
            duration: 0.3,
            yoyo: Infinity
        }
    }
};

const Login: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState<boolean>(false);
    const router = useRouter();

    const handleSubmit = async (event: React.FormEvent) => {
        setLoading(true);
        event.preventDefault();

        const response = await fetch(`${config.API_BASE_URL}api/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        const result = await response.json();
        if (response.ok) {
            alert('Login successful!');
            // Store the token or handle successful login
            localStorage.setItem('token', result.accessToken);
            localStorage.setItem('username', result.username);
            localStorage.setItem('role', result.role)

            // Redirect to user page
            router.push('/user');
        } else {
            alert('Login failed: ' + result.error);
        }
        setLoading(false);
    };
    const containerStyle: React.CSSProperties = {
        width: '470px',
        padding: '70px 20px 20px 20px',
        border: '0px solid #ccc',
        margin: '50px auto',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        borderRadius: '8px',
        backgroundColor: '#fff',
        position: 'absolute', top: '40%', left: '61%', transform: 'translate(-90%, -40%)'
    };   
    return (
        <div>
            <Header />
            <div className="auth-container" style={containerStyle}>
            <span style={{ fontSize: '22px', fontWeight: '500px', position: 'absolute', top: '98%', left: '50%', transform: 'translate(-320%, -640%)', letterSpacing: '0.05px', wordSpacing: '0.1px' }}>
                Login
                </span> 
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Username"
                        required
                    />
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        required
                    />
                    {/* <button
                        type="submit"
                        className="button"
                        whileHover="hover"
                    > */}
                    
                        {/* Login */}
                    {/* </button> */}
                    <motion.button
                        type="submit"
                        disabled = {loading}
                        className="w-full sm:w-auto rounded-lg py-3 px-6 sm:py-2 sm:px-8 text-white bg-blue-500 focus:outline-none focus:ring"
                        // whileHover={{ scale: 1.05 }}
                    >
                        {loading ? <CircularProgress size={24} color="inherit" style={{ marginLeft: 'auto', marginRight: 'auto' }} /> : 'Login'}
                    </motion.button>
                </form>
            </div>
            {/* <Footer /> */}
        </div>
    );
};

export default Login;