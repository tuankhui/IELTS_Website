"use client";
import axios, { AxiosError } from 'axios';
import React, { useState } from 'react';
import '../styles/Auth.css';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import Footer from '../components/Footer';
import config from '../config';
import { motion } from 'framer-motion';
import { Container, TextField, Button, Typography, Paper, CircularProgress } from '@mui/material';

const Login: React.FC = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [countNB, setCountNB] = useState<number>(0);
    const [countER, setCountER] = useState<number>(0);

    const handleSubmit = async () => {
        const token = localStorage.getItem('token');
        setLoading(true);

        for (let i = 0; i < 10; i++) {
            try{
                const response = await axios.post(
                    `${config.API_BASE_URL}api/generate-random-task2`,{},
                    { headers: { Authorization: `Bearer ${token}` } });
                setCountNB(countNB + 1);
            }
            catch{
                setCountER(countER + 1);
            }
        }
        
        setLoading(false);
    };
   
    return (
        <div>
            <Header />
            countNumber: {countNB}
            countError: {countER}
                    <motion.button
                        type="submit"
                        disabled = {loading}
                        className="w-full sm:w-auto rounded-lg py-3 px-6 sm:py-2 sm:px-8 text-white bg-blue-500 focus:outline-none focus:ring"
                        onClick={handleSubmit}
                        // whileHover={{ scale: 1.05 }}
                    >
                        {loading ? <CircularProgress size={24} color="inherit" style={{ marginLeft: 'auto', marginRight: 'auto' }} /> : 'Click [Task1]'}
                    </motion.button>
            <Footer />
        </div>
    );
};

export default Login;