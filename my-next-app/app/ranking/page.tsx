'use client';

import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Container, Typography, Paper } from '@mui/material';
import { motion } from 'framer-motion';
import Link from 'next/link';

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

const PracticeSelectionPage: React.FC = () => {
    return (
        <div>
            <Header />
                Ranking Page
            <Footer />
        </div>
    );
};

export default PracticeSelectionPage;
