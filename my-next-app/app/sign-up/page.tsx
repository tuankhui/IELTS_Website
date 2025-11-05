"use client";

import React, { useState } from 'react';
import '../styles/Auth.css';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './RoleSelectionForm.css'; // Assuming you save your CSS in this file
import config from '../config';
import { Container, TextField, Button, Typography, Paper, CircularProgress } from '@mui/material';


import { motion } from 'framer-motion';

// Example of animating buttons
const buttonVariants = {
    hover: {
        scale: 1.1,
        transition: {
            duration: 0.3,
            yoyo: Infinity
        }
    }
};

const Signup: React.FC = () => {
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [cfpassword, setCfpassword] = useState('');
    const [role, setRole] = useState('');
    const [loading, setLoading] = useState<boolean>(false);
    const router = useRouter();

    const handleSubmit = async (event: React.FormEvent) => {
        setLoading(true);
        event.preventDefault();

        if(password != cfpassword){
            alert("Your password you type did not match.");
        }
        else{
            const response = await fetch(`${config.API_BASE_URL}api/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, username, email, password, role }),
            });
    
            const result = await response.json();
            if (response.ok) {
                alert('Signup successful!');
    
                // Automatically log the user in
                const loginResponse = await fetch(`${config.API_BASE_URL}api/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username, password }),
                });
    
                const loginResult = await loginResponse.json();
                if (loginResponse.ok) {
                    localStorage.setItem('token', loginResult.accessToken);
                    localStorage.setItem('username', loginResult.username);
                    alert('Login successful!');
                    
                    // Redirect to home page
                    router.push('/');
                } else {
                    alert('Auto-login failed: ' + loginResult.error);
                }
            } else {
                alert('Signup failed: ' + result.error);
            }
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
                <span style={{ fontSize: '22px', fontWeight: '500px', position: 'absolute', top: '98%', left: '50%', transform: 'translate(-230%, -1250%)', letterSpacing: '0.05px', wordSpacing: '0.1px' }}>
                    Sign Up
                </span> 
                <form onSubmit={handleSubmit}>
                    {/* Name */}
                    <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name"
                        required
                    />
                    {/* Username */}
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Username"
                        required
                    />
                    {/* Gmail */}
                    <input
                        type="text"
                        id="gmail"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Work or school email"
                        required
                    />
                    {/* Password */}
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        required
                    />
                    {/* Confirm Password */}
                    <input
                        type="password"
                        id="cfpassword"
                        value={cfpassword}
                        onChange={(e) => setCfpassword(e.target.value)}
                        placeholder="Confirm password"
                        required
                    />
                    <div className="radio-group">
                        <input
                            type="radio"
                            id="student"
                            name="role"
                            value="Student"
                            checked={role === 'Student'}
                            onChange={(e) => setRole(e.target.value)}
                            required
                        />
                        <label htmlFor="student" className="radio-label">Student</label>
                        
                        <input
                            type="radio"
                            id="teacher"
                            name="role"
                            value="Teacher"
                            checked={role === 'Teacher'}
                            onChange={(e) => setRole(e.target.value)}
                            required
                        />
                        <label htmlFor="teacher" className="radio-label">Teacher</label>
                    </div>
                    {/* <button
                        type="submit"
                        className="button"
                        whileHover="hover"
                        > */}
                    <motion.button
                        type="submit"
                        disabled={loading}
                        className="w-full sm:w-auto rounded-lg py-3 px-6 sm:py-2 sm:px-8 text-white bg-blue-500 focus:outline-none focus:ring"
                        // whileHover={{ scale: 1.1 }}
                    >
                        
                        {loading ? <CircularProgress size={24} color="inherit" style={{ marginLeft: 'auto', marginRight: 'auto' }} /> : 'Agree and Sign up'}

                    </motion.button>
                        {/* <div> */}
                            {/* Agree and Sign up */}
                        {/* </div> */}
                    {/* </button> */}
                </form>
            </div>
            {/* <Footer /> */}
        </div>
    );
};

export default Signup;