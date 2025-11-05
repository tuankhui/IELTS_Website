'use client';
import React, { useState } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Container, Typography, Paper, Grid, TextField, Button, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import config from '../config';

const buttonVariants = {
  hover: {
    scale: 1.1,
    transition: {
      duration: 0.3,
      yoyo: Infinity
    }
  }
};

// Define a type that includes all possible options
type OptionType = 'political' | 'economic' | 'social' | 'technology' | 'environment' | 'legal';

const PracticeVocabPage: React.FC = () => {
  const [selectedOption, setSelectedOption] = useState<OptionType | null>(null);
  const [questions, setQuestions] = useState<string[]>([]);
  const [definitions, setDefinitions] = useState<string[]>([]);
  const [correctAnswers, setCorrectAnswers] = useState<string[]>([]);
  const [userAnswers, setUserAnswers] = useState<string[]>(new Array(10).fill(''));
  const [results, setResults] = useState<boolean[]>(new Array(10).fill(false));
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchQuestions = async (topic: OptionType) => {
    setLoading(true);

    try {
        const token = localStorage.getItem('token');
        const response = await axios.post(`${config.API_BASE_URL}api/generate-vocab-with-topic`, { topic }, {
        headers: {
            'Authorization': `Bearer ${token}`
        }});
  
      if (response.data && response.data.vocabulary) {
        const lines: string[] = response.data.vocabulary.split('\n').map((line: string) => line.trim()).filter(Boolean);
        
        // Debugging logs
        console.log("Fetched lines:", lines);
        console.log("Number of Fetched lines:", lines.length);
        
        if (lines.length < 30) {
          console.error('Not enough data lines to extract questions and answers.');
          return;
        }
  
        const questions = lines.slice(0, 10);
        const definitions = lines.slice(10, 20);
        const answers = lines.slice(20, 30).map((answer: string) => answer.trim().toUpperCase());
  
        setQuestions(questions);
        setDefinitions(definitions);
        setCorrectAnswers(answers);
          
        // console.log("Questions:", questions);
        // console.log("Definitions:", definitions);
        // console.log("Correct Answers:", answers);
        // console.log("Number of Correct Answers:", answers.length);
      } else {
        console.error('Unexpected response format:', response.data);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };


  
  const handleButtonClick = (type: OptionType) => {
    setSelectedOption(type);
    fetchQuestions(type);
  };

  const handleAnswerChange = (index: number, value: string) => {
    const newUserAnswers = [...userAnswers];
    // Normalize user input
    newUserAnswers[index] = value.trim().toUpperCase();
    setUserAnswers(newUserAnswers);
  };

  const handleCheckAnswers = () => {
    const newResults = userAnswers.map((answer, index) => {
      if (!correctAnswers[index]) {
        console.warn(`Warning: missing correct answer for question ${index + 1}`);
        return false;
      }
  
      const correctAnswer = correctAnswers[index].trim().toUpperCase();
      const userAnswer = answer.trim().toUpperCase();
  
      //console.log(`Question ${index + 1} - User Answer: '${userAnswer}', Correct Answer: '${correctAnswer}'`);
  
      if (userAnswer !== correctAnswer) {
        // console.log(`Mismatch at Question ${index + 1}:`);
        // console.log(`Expected (Correct Answer): '${correctAnswer}'`);
        // console.log(`Received (User Answer): '${userAnswer}'`);
        // console.log(`Correct Answer Length: ${correctAnswer.length}, User Answer Length: ${userAnswer.length}`);
        // console.log(`Correct Answer Chars: ${correctAnswer.split('')}`);
        // console.log(`User Answer Chars: ${userAnswer.split('')}`);
      }
  
      return userAnswer === correctAnswer;
    });
    setResults(newResults);
    setSubmitted(true);
  };

  const getAnswerColor = (index: number) => {
    if (!submitted) return {};

    return results[index]
      ? { color: 'green' }
      : { color: 'red' };
  };
  
  return (
    <div>
      <Header />
      <div className="bg-gradient-to-b from-transparent to-white text-gray-800 min-h-screen flex items-center justify-center">
        <Container maxWidth="md" className="p-6 rounded-lg shadow-lg bg-white dark-mode:bg-gray-800">
          <Typography variant="h3" className="text-4xl mb-6 text-blue-900 text-center font-bold">
            Practice Vocabulary
          </Typography>

          <Paper elevation={3} className="p-10 mb-10 rounded-lg text-center">
            {selectedOption === null ? (
              <div>
                <Grid container spacing={3}>
                  {(['political', 'economic', 'social', 'technology', 'environment', 'legal'] as OptionType[]).map((type) => (
                    <Grid item xs={4} key={type}>
                      <motion.button
                        variants={buttonVariants}
                        whileHover="hover"
                        className="w-full mb-4 rounded-lg py-3 px-6 bg-gradient-to-r from-teal-500 to-teal-700 text-white hover:bg-blue-800 focus:outline-none focus:ring"
                        onClick={() => handleButtonClick(type)}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </motion.button>
                    </Grid>
                  ))}
                </Grid>
              </div>
            ) : (
              loading ? (
                <Typography variant="h6">Loading questions...</Typography>
              ) : (
                <div>
                  <Grid container spacing={3}>
                    <Grid item xs={6}>
                      {questions.map((question, index) => (
                        <Typography variant="body2" style={{ fontSize: '0.875rem', 
                            fontFamily: '"JetBrains Mono", monospace' }} key={index}>
                          {question}
                        </Typography>
                      ))}
                    </Grid>
                    <Grid item xs={6}>
                      {definitions.map((definition, index) => (
                        <Typography variant="body2" style={{ fontSize: '0.875rem', 
                            fontFamily: '"JetBrains Mono", monospace' }} key={index}>
                          {definition}
                        </Typography>
                      ))}
                    </Grid>
                  </Grid>

                  <Grid container spacing={2}>
                    {questions.map((_, index) => (
                      <Grid item xs={12} key={index}>
                        <TextField
                          label={`Answer ${index + 1}`}
                          variant="outlined"
                          fullWidth
                          value={userAnswers[index]}
                          onChange={(e) => handleAnswerChange(index, e.target.value)}
                          InputProps={{
                            style: getAnswerColor(index)
                          }}
                          FormHelperTextProps={{
                            style: getAnswerColor(index)
                          }}
                          error={submitted && results[index] === false}
                          helperText={!submitted ? '' : (results[index] === false ? 'Incorrect' : 'Correct')}
                        />
                      </Grid>
                    ))}
                  </Grid>

                  <Button
                    variant="contained"
                    color="primary"
                    className="mt-4"
                    onClick={handleCheckAnswers}
                  >
                    Check Answers
                  </Button>
                </div>
              )
            )}
          </Paper>
        </Container>
      </div>
      <Footer />
    </div>
  );
};

export default PracticeVocabPage;