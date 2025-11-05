'use client';

import React from 'react';
import SubmitDemo from '../components/EssayComponent';
import styles from './HomePage.module.css';

const HomePage: React.FC = () => {
    return (
        <div className={styles.container}>
            <div className={styles.textContainer}>
                <h1 className={styles.mainText}>Responsible AI that ensures your writing and reputation shine</h1>
            </div>
            <div className={styles.content}>
                <SubmitDemo />
            </div>
            <div className={styles.textContainer}>
                <p className={styles.subText}>Work with an AI writing partner that helps you find the words you need⁠—⁠to write that tricky essay, to get your point across, to keep your work moving.</p>
                <p className={styles.trustedText}>Trusted by Nguyen Chuong, Tuan Khoi, Dinh Gia Bao and other 8 people</p>
            </div>
        </div>
    );
};

export default HomePage;