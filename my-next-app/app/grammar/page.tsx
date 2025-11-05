'use client';

import React, { useState } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Container, Typography, Paper, Grid, TextField, Button } from '@mui/material';
import { motion } from 'framer-motion';

const buttonVariants = {
    hover: {
        scale: 1.1,
        transition: {
            duration: 0.3,
            yoyo: Infinity
        }
    }
};

const tenses = [
    'Present Simple', 'Past Simple', 'Future Simple', 'Present Continuous',
    'Past Continuous', 'Future Continuous', 'Present Perfect', 'Past Perfect', 
    'Future Perfect', 'Present Perfect Continuous', 'Past Perfect Continuous', 'Future Perfect Continuous'
];

const PracticeVocabPage: React.FC = () => {
    const [selectedOption, setSelectedOption] = useState<'structure' | 'exercise' | null>(null);
    const [topic, setTopic] = useState<string>('');
    const [questions, setQuestions] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchQuestions = async (type: 'structure' | 'exercise', topic?: string) => {
        setLoading(true);
        try {
            const response = await axios.post('/api/generate-questions', {
                type,
                topic
            });
            setQuestions(response.data.questions);
        } catch (error) {
            console.error('Error fetching questions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStructureClick = () => {
        setSelectedOption('structure');
    };

    const handleTenseClick = (tense: string) => {
        setTopic(tense);
        fetchQuestions('structure', tense);
    };

    const handleGenerateQuestions = async () => {
        fetchQuestions('exercise', topic);
    };

    return (
        <div>
            <Header />
            <div className="bg-gradient-to-b from-transparent to-white text-gray-800 min-h-screen flex items-center justify-center">
                <Container maxWidth="md" className="p-6 rounded-lg shadow-lg bg-white dark-mode:bg-gray-800">
                    <Typography variant="h3" className="text-4xl mb-6 text-blue-900 text-center font-bold">
                        Practice Grammar
                    </Typography>
                    
                    <Paper elevation={3} className="p-10 mb-10 rounded-lg text-center">
                        {selectedOption === null && (
                            <div>
                                <motion.button
                                    variants={buttonVariants}
                                    whileHover="hover"
                                    className="w-full mb-4 rounded-lg py-3 px-6 bg-gradient-to-r from-teal-500 to-teal-700 text-white hover:bg-blue-800 focus:outline-none focus:ring"
                                    onClick={handleStructureClick}
                                >
                                    Structure
                                </motion.button>
                                <motion.button
                                    variants={buttonVariants}
                                    whileHover="hover"
                                    className="w-full mb-4 rounded-lg py-3 px-6 bg-gradient-to-r from-teal-500 to-teal-700 text-white hover:bg-blue-800 focus:outline-none focus:ring"
                                    onClick={() => setSelectedOption('exercise')}
                                >
                                    Exercise
                                </motion.button>
                            </div>
                        )}
                        
                        {selectedOption === 'structure' && (
                            <Grid container spacing={3}>
                                {tenses.map((tense, index) => (
                                    <Grid item xs={12} sm={6} md={4} key={index}>
                                        <motion.button
                                            variants={buttonVariants}
                                            whileHover="hover"
                                            className="w-full mb-4 rounded-lg py-3 px-6 bg-gradient-to-r from-teal-500 to-teal-700 text-white hover:bg-blue-800 focus:outline-none focus:ring"
                                            onClick={() => handleTenseClick(tense)}
                                        >
                                            {tense}
                                        </motion.button>
                                    </Grid>
                                ))}
                            </Grid>
                        )}

                        {selectedOption === 'exercise' && (
                            <div>
                                <Grid container spacing={3} className="mt-4">
                                    <Grid item xs={12}>
                                        <TextField
                                            label="Tense"
                                            variant="outlined"
                                            fullWidth
                                            value={topic}
                                            onChange={(e) => setTopic(e.target.value)}
                                            className="mb-4"
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Button variant="contained" color="primary" onClick={handleGenerateQuestions}>
                                            Generate Questions
                                        </Button>
                                    </Grid>
                                </Grid>
                                {loading && <Typography variant="h6" className="mt-4">Loading questions...</Typography>}
                                <Grid container spacing={3} className="mt-4">
                                    {!loading && questions.map((question, index) => (
                                        <Grid item xs={12} key={index}>
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                            >
                                                <Typography variant="h6" className="mb-2">
                                                    {question}
                                                </Typography>
                                            </motion.div>
                                        </Grid>
                                    ))}
                                </Grid>
                            </div>
                        )}
                    </Paper>
                </Container>
            </div>
            <Footer />
        </div>
    );
};

export default PracticeVocabPage;
