'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';

import Header from '../components/Header';
import Footer from '../components/Footer';
import UserProfile from './UserProfile';
import config from '../config';
import '../styles/Auth.css';
import styles from './UserProfile.module.css';

interface Submission {
  task_id: string;
  created_at: string;
  evaluated_by: string;
  paragraph: string;
}

const UserProfilePage: React.FC = () => {
    const [username, setUsername] = useState<string | null>(null);
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const router = useRouter();

    useEffect(() => {
        const storedUser = localStorage.getItem('username');
        if (storedUser) {
            setUsername(storedUser);
            fetchSubmissions(storedUser);
        } else {
            router.push('/login');
        }
    }, [router]);

    const fetchSubmissions = async (username: string) => {
        try {
            const token = localStorage.getItem('token'); // Retrieves the token from local storage
            if (!token) {
                throw new Error('No token found in local storage');
            }
    
            const { data } = await axios.get(`${config.API_BASE_URL}api/get_evaluations?user=${username}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            setSubmissions(data);
        } catch (error) {
            console.error('Error fetching submissions:', error);
        }
    };

    if (!username) {
        return <div>Loading...</div>;
    }

    const submissionDates = submissions.map(submission => new Date(submission.created_at).toLocaleDateString());
    const submissionCounts = submissionDates.reduce((acc: { [key: string]: number }, date) => {
        acc[date] = (acc[date] || 0) + 1;
        return acc;
    }, {});

    const chartData = {
        labels: Object.keys(submissionCounts),
        datasets: [
            {
                label: 'Submissions',
                data: Object.values(submissionCounts),
                backgroundColor: 'rgba(75,192,192,0.6)',
                borderColor: 'rgba(75,192,192,1)',
                borderWidth: 1,
            },
        ],
    };

    return (
        <div>
            <Header />
            <div className={styles.userProfileContainer}>
                <h2 className={styles.profileName}>{username}</h2>
                <div className={styles.profileImage}>
                    <img src="/avatar.jpg" alt="Avatar" style={{ width: '100%', borderRadius: '50%' }} />
                    {/* <div className={styles.profileTextContainer}> */}
                        {/* <span className={styles.profileText}>{username}</span> */}
                    {/* </div> */}
                </div>
                <button className="w-full sm:w-auto rounded-lg py-3 px-6 sm:py-2 sm:px-8 text-white bg-blue-500 focus:outline-none focus:ring">Edit Profile</button>
            </div>
            <div className={styles.chartContainer}>
                <h3>Submission Frequency</h3>
                <Bar data={chartData} />
            </div>
            <div className={styles.submissionHistory}>
                <h3>Submission History</h3>
                <ul>
                    {submissions.map((submission, index) => (
                        <li key={index}>
                            Task ID: {submission.task_id} - Submitted at: {new Date(submission.created_at).toLocaleString()}
                        </li>
                    ))}
                </ul>
            </div>
            <Footer />
        </div>
    );
};

export default UserProfilePage;
