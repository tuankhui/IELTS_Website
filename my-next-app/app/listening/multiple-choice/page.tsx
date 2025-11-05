'use client';

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import config from '../../config';

const ReadingPage = () => {
  const [paragraph, setParagraph] = useState('');
  const [questions, setQuestions] = useState<{ question: string; options: string[] }[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [submittedAnswers, setSubmittedAnswers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState('openai/gpt-4o-mini');
  // const [difficulty, setDifficulty] = useState('normal');
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [speechActive, setSpeechActive] = useState(false);
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
  const [lastChunkIndex, setLastChunkIndex] = useState(0);
  const [speed, setSpeed] = useState(1.0);
  const [showAnotherTestButton, setShowAnotherTestButton] = useState(false);
  const [showAnswers, setShowAnswers] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [showScore, setShowScore] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState<boolean[]>([]);
  const [incorrectAnswers, setIncorrectAnswers] = useState<boolean[]>([]);
  const [difficulty, setDifficulty] = useState('Easy');
  const [showTranscript, setShowTranscript] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false); // New state to track submission
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const chunksRef = useRef<string[]>([]);

  useEffect(() => {
    const fetchVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      const englishVoices = availableVoices.filter(voice => voice.lang.startsWith('en'));
      setVoices(englishVoices);
    };

    fetchVoices();

    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = fetchVoices;
    }
  }, []);

  useEffect(() => {
    const fetchVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      const englishVoices = availableVoices.filter(voice => voice.lang.startsWith('en'));
      setVoices(englishVoices);
    };

    fetchVoices();

    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = fetchVoices;
    }
  }, []);

  const speakParagraph = () => {
    if (!paragraph || !selectedVoice) return;
  
    const chunkSize = 200;
    let chunks = [];
    for (let i = 0; i < paragraph.length; i += chunkSize) {
      chunks.push(paragraph.substring(i, i + chunkSize));
    }
    chunksRef.current = chunks;
  
    const speakChunksSequentially = (index: number) => {
      if (index >= chunks.length) {
        setSpeechActive(false);
        setCurrentChunkIndex(0);
        return;
      }
  
      const utterance = new SpeechSynthesisUtterance(chunks[index]);
      utterance.voice = selectedVoice;
      utterance.lang = selectedVoice.lang;
      utterance.pitch = 1;
      utterance.rate = speed;
      utterance.volume = 1;
  
      utterance.onstart = () => {
        setCurrentChunkIndex(index);
      };
  
      utterance.onend = () => {
        setLastChunkIndex(index + 1);
        if (speechActive) {
          speakChunksSequentially(index + 1);
        } else {
          setSpeechActive(false); // Ensure speechActive is false when stopping
        }
      };
  
      window.speechSynthesis.speak(utterance);
      utteranceRef.current = utterance;
    };
  
    // Stop any ongoing speech synthesis before starting a new one
    window.speechSynthesis.cancel();
  
    setCurrentChunkIndex(0); // Reset the current chunk index
    setLastChunkIndex(0); // Reset the last chunk index
    setSpeechActive(true);
    speakChunksSequentially(0);
  };
  
  useEffect(() => {
    if (speechActive) {
      speakParagraph();
    }
  
    // Cleanup function to stop speech synthesis when the component unmounts or speechActive changes
    return () => {
      window.speechSynthesis.cancel();
    };
  }, [paragraph, selectedVoice, speechActive, speed]);

  const fetchReadingMaterial = async (task : string) => {
    stopSpeech();
    setLoading(true);
    console.log("fetching reading material");
    try {
      console.log("it has go here");
      
      const response = await axios.post(`${config.API_BASE_URL}api/generate-reading-material `, { model, task, difficulty });
      console.log("go here too");
      const { paragraph, questions, answers } = response.data;
      console.log("wow", paragraph);
      setParagraph(paragraph);
      setQuestions(questions);
      setAnswers(answers);
      setUserAnswers(new Array(questions.length).fill('')); // Initialize userAnswers
      setCorrectAnswers(new Array(questions.length).fill(false)); // Initialize correctAnswers
      setIncorrectAnswers(new Array(questions.length).fill(false)); // Initialize incorrectAnswers
      setIsSubmitted(false); // Reset submission state
      setShowAnotherTestButton(false); // Hide "Another Test" button for new test
      setShowScore(false); // Hide score for new test
      setShowAnswers(false); // Hide answers for new test
      setShowTranscript(false); // Hide transcript for new test
    } catch (error) {
      console.error('Error fetching reading material:', error);
    }
    setLoading(false);
  };

  const handleSelectVoice = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedVoiceName = event.target.value;
    const voice = voices.find(voice => voice.name === selectedVoiceName);

    if (speechActive) {
      stopSpeech();
    }

    setSelectedVoice(voice || null);
  };

  const handleStopOrContinueSpeech = () => {
    if (speechActive) {
      stopSpeech();
    } else {
      continueSpeech();
    }
  };

  const stopSpeech = () => {
    if (utteranceRef.current) {
      utteranceRef.current.onend = null;
      window.speechSynthesis.pause();
    }
    setSpeechActive(false);
  };

  const continueSpeech = () => {
    if (lastChunkIndex < paragraph.length) {
      window.speechSynthesis.resume();
      setSpeechActive(true);
    }
  };

  const handleSpeedChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSpeed = parseFloat(event.target.value);
    setSpeed(newSpeed);
    if (speechActive) {
      stopSpeech();
      continueSpeech();
    }
  };

  useEffect(() => {
    const initialSpeech = new SpeechSynthesisUtterance('');
    window.speechSynthesis.speak(initialSpeech);
  }, []);

  const toggleAnswers = () => {
    setShowAnswers(!showAnswers); // Toggle the state to show/hide answers
  };

  const handleAnswerChange = (questionIndex: number, answer: string) => {
    const newUserAnswers = [...userAnswers];
    newUserAnswers[questionIndex] = answer;
    setUserAnswers(newUserAnswers);
  };

  const handleSubmit = () => {
    // Check if all answers are selected
    if (userAnswers.some(answer => answer === '')) {
      alert('Please answer all the questions before submitting.');
      return;
    }

    setSubmittedAnswers(userAnswers);
    setShowAnswers(true); // Show the answers after submission
    setIsSubmitted(true); // Mark as submitted

    // Calculate score and mark correct and incorrect answers
    let newScore = 0;
    const newCorrectAnswers = [...correctAnswers];
    const newIncorrectAnswers = [...incorrectAnswers];

    userAnswers.forEach((answer, index) => {
      if (answer === answers[index]) {
        newScore += 10;
        newCorrectAnswers[index] = true;
        newIncorrectAnswers[index] = false;
      } else {
        newCorrectAnswers[index] = false;
        newIncorrectAnswers[index] = true;
      }
    });

    setScore(newScore);
    setCorrectAnswers(newCorrectAnswers);
    setIncorrectAnswers(newIncorrectAnswers);
    setShowScore(true); // Show the score after submission
    setShowTranscript(true); // Show the transcript after submission
    setShowAnotherTestButton(true); // Show "Another Test" button after submission
  };

  const handleShowScore = () => {
    setShowScore(true);
  };

  const getScoreColor = (score : number | null) => {
    if (score! <= 30) return 'text-black';
    if (score! <= 60) return 'text-purple-500';
    if (score! >= 70) return 'text-red-500';
    if (score === 100) return 'text-green-500';
  };
  
  return (
    <div className="flex flex-col">
      <Header />
      <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">IELTS Listening Practice</h1>
        <div className="flex space-x-4">
          <button 
            onClick={() => fetchReadingMaterial('Multiple Choices')} 
            disabled={loading} 
            className="bg-blue-500 text-white px-6 py-3 rounded-md shadow-md hover:bg-blue-600 transition duration-300 disabled:opacity-50"
          >
            {loading ? 'Generating...' : 'Multiple Choices'}
          </button>
        </div>

        <div className="mt-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Select Difficulty</h2>
          <select onChange={(e) => setDifficulty(e.target.value)} className="px-4 py-2 rounded bg-gray-300 text-black">
            <option value="easy">Easy</option>
            <option value="normal">Normal</option>
            <option value="hard">Hard</option>
            <option value="extremely">Extremely</option>
          </select>
        </div>

        <div className="mt-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Select Voice</h2>
          <select onChange={handleSelectVoice} className="px-4 py-2 rounded bg-gray-300 text-black">
            <option value="">Select a voice</option>
            {voices.map((voice, index) => (
              <option key={index} value={voice.name}>
                {voice.name} ({voice.lang})
              </option>
            ))}
          </select>
        </div>

        <div className="mt-6">
          <label htmlFor="speed" className="text-xl font-semibold text-gray-800 mb-2 block">Adjust Speed:</label>
          <input 
            type="range" 
            id="speed" 
            name="speed" 
            min="0.5" 
            max="1.8" 
            step="0.1" 
            value={speed} 
            onChange={handleSpeedChange} 
            className="w-64"
          />
          <span className="text-gray-700 ml-2">{speed.toFixed(1)}x</span>
        </div>

        <div className="mt-6">
          <button 
            onClick={handleStopOrContinueSpeech} 
            className={`px-6 py-3 rounded-md shadow-md ${speechActive ? 'bg-red-500 text-white' : 'bg-green-500 text-white'} hover:bg-red-600 transition duration-300`}
          >
            {speechActive ? 'Stop Speaking' : 'Continue Speaking'}
          </button>
        </div>
        
        {questions.length > 0 && (
          <div className="mt-10 max-w-3xl bg-white shadow-md rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Questions</h2>
            {questions.map((questionObj, index) => (
              <div key={index} className="mb-4">
                <p className="text-gray-700">{questionObj.question}</p>
                {questionObj.options.map((option, optIndex) => (
                  <label key={optIndex} className="block text-gray-700 ml-4">
                    <input 
                      type="radio" 
                      name={`question-${index}`} 
                      value={String.fromCharCode(65 + optIndex)} // 'A', 'B', 'C', etc.
                      checked={userAnswers[index] === String.fromCharCode(65 + optIndex)} 
                      onChange={() => handleAnswerChange(index, String.fromCharCode(65 + optIndex))} 
                      className="mr-2"
                      disabled={isSubmitted} // Disable radio buttons after submission
                    />
                    {String.fromCharCode(65 + optIndex)}: {option}
                  </label>
                ))}
                {showAnswers && (
                  <div className="mt-2">
                    {correctAnswers[index] ? (
                      <span className="text-green-500">Correct Answer: {answers[index]}</span>
                    ) : incorrectAnswers[index] ? (
                      <>
                        <span className="text-red-500">Your Answer: {userAnswers[index]}</span><br />
                        <span className="text-green-500">Correct Answer: {answers[index]}</span>
                      </>
                    ) : null}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {questions.length > 0 && (
          <div className="mt-6 flex space-x-4">
            <button 
              onClick={handleSubmit} 
              className="px-6 py-3 rounded-md shadow-md bg-green-500 text-white hover:bg-green-600 transition duration-300"
              disabled={isSubmitted} // Disable submit button after submission
            >
              Submit
            </button>
          </div>
        )}

        {showScore && (
          <div className={`mt-10 text-3xl font-bold ${getScoreColor(score)}`}>
            Your Score: {score} / 100
          </div>
        )}

        {showTranscript && (
          <div className="mt-10 max-w-3xl bg-white shadow-md rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Transcript</h2>
            <p className="text-gray-700">{paragraph}</p>
          </div>
        )}
        {showAnotherTestButton && (
        <button 
          onClick={() => fetchReadingMaterial('Multiple Choices')} 
          disabled={loading}
          className="bg-green-500 text-white px-6 py-3 rounded-md shadow-md hover:bg-green-600 transition duration-300 mt-6"
        >
          {loading ? 'Generating...' : 'Another Test'}
        </button>
      )}
      </div>
      <Footer/>
    </div>
  );
};

export default ReadingPage;
