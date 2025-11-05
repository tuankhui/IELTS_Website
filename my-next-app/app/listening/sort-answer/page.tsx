'use client';

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import config from '../../config';

const ReadingPage = () => {
  const [paragraph, setParagraph] = useState('');
  const [questions, setQuestions] = useState<string[]>([]);
  const [answerkey, setAnswerkey] = useState([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState('openai/gpt-4o-mini');

  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [speechActive, setSpeechActive] = useState(false);
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
  const [lastChunkIndex, setLastChunkIndex] = useState(0);
  const [speed, setSpeed] = useState(1.0);
  const [difficulty, setDifficulty] = useState('Easy');
  const [answersChecked, setAnswersChecked] = useState(false);
  const [showParagraph, setShowParagraph] = useState(false); // New state variable
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

  const speakParagraph = () => {
    if (!paragraph || !selectedVoice) return;
  
    const chunkSize = 200;
    let chunks = [];
    for (let i = 0; i < paragraph.length; i += chunkSize) {
      chunks.push(paragraph.substring(i, i + chunkSize));
    }
    chunksRef.current = chunks;
  
    const speakChunksSequentially = (index:number) => {
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

  const fetchReadingMaterial = async (task:string) => {
    setLoading(true);
    try {
      const response = await axios.post(`${config.API_BASE_URL}api/generate-reading-material`, { model, task, difficulty });
      const { paragraph, questions, answerkey } = response.data;
      setParagraph(paragraph);
      setQuestions(questions);
      setAnswerkey(answerkey);
      setAnswers(new Array(questions.length).fill(''));
      setResults(new Array(questions.length).fill(null));
      setAnswersChecked(false); // Reset the answersChecked state
      setLoading(false);
      setShowParagraph(false); // Hide the paragraph initially
      // Automatically start speaking once the paragraph is generated
      handleStopOrContinueSpeech();
    } catch (error) {
      console.error('Error fetching listening material:', error);
      setLoading(false);
    }
  };

  const handleSelectVoice = (event:React.ChangeEvent<HTMLSelectElement>) => {
    const selectedVoiceName = event.target.value;
    const voice = voices.find(voice => voice.name === selectedVoiceName);

    if (speechActive) {
      stopSpeech();
    }

    setSelectedVoice(voice ||null);
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
      window.speechSynthesis.cancel();
    }
    setSpeechActive(false);
  };

  const continueSpeech = () => {
    if (lastChunkIndex < paragraph.length) {
      window.speechSynthesis.resume();
      setSpeechActive(true);
    }
  };

  const handleSpeedChange = (event:React.ChangeEvent<HTMLInputElement>) => {
    const newSpeed = parseFloat(event.target.value);
    setSpeed(newSpeed);
    if (speechActive) {
      stopSpeech();
      continueSpeech();
    }
  };

  const handleDifficultyChange = (event:React.ChangeEvent<HTMLSelectElement>) => {
    setDifficulty(event.target.value);
  };

  const handleAnswerChange = (index:number, event:React.ChangeEvent<HTMLInputElement>) => {
    const newAnswers = [...answers];
    newAnswers[index] = event.target.value;
    setAnswers(newAnswers);
  };

  const checkAnswers = () => {
    const newResults = questions.map((question, index) => {
      const correctAnswer = answerkey[index-5];
      return answers[index].toUpperCase() === correctAnswer ? 'Correct' : 'Incorrect';
    });
    setResults(newResults);
    setAnswersChecked(true); // Set answersChecked to true when answers are checked
setShowParagraph(true); // Show the paragraph when answers are checked
  };

  useEffect(() => {
    const initialSpeech = new SpeechSynthesisUtterance('');
    window.speechSynthesis.speak(initialSpeech);
  }, []);

  return (
    <div className="flex flex-col">
      <Header />
      <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">IELTS Listening Practice</h1>
        <div className="flex space-x-4">
          <button 
            onClick={() => fetchReadingMaterial('sort-answer')} 
            disabled={loading} 
            className="bg-blue-500 text-white px-6 py-3 rounded-md shadow-md hover:bg-blue-600 transition duration-300 disabled:opacity-50"
          >
            {loading ? 'Generating...' : 'Sort Answer'}
          </button>
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
          <label htmlFor="difficulty" className="text-xl font-semibold text-gray-800 mb-2 block">Select Difficulty:</label>
          <select id="difficulty" name="difficulty" value={difficulty} onChange={handleDifficultyChange} className="px-4 py-2 rounded bg-gray-300 text-black">
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>

        <div className="mt-6">
          <button 
            onClick={handleStopOrContinueSpeech} 
            disabled={loading} 
            className={`px-6 py-3 rounded-md shadow-md ${speechActive ? 'bg-red-500 text-white' : 'bg-green-500 text-white'} hover:bg-red-600 transition duration-300`}
          >
            {loading ? 'Generating...' : (speechActive ? 'Stop Speaking' : 'Continue Speaking')}
          </button>
        </div>

        {showParagraph && paragraph && (
          <div className="mt-10 max-w-3xl bg-white shadow-md rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Generated Paragraph</h2>
<p className="text-gray-700">{paragraph}</p>
          </div>
        )}

        {questions.length > 0 && (
          <div className="mt-10 max-w-3xl bg-white shadow-md rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Questions</h2>
            {questions.map((question, index) => (
              <div key={index} className="mb-4">
                {typeof question === 'string' && question.match(/^\d+\./) ? (
                  <>
                    <p className="text-gray-700">{question}</p>
                    <input 
                      type="text" 
                      value={answers[index]} 
                      onChange={(e) => handleAnswerChange(index, e)} 
                      className="w-full mt-2 px-4 py-2 border rounded-md" 
                      placeholder="Write your answer here..."
                    />
                    {results[index] && (
                      <p className={`mt-2 ${results[index] === 'Correct' ? 'text-green-500' : 'text-red-500'}`}>
                        {results[index]}
                      </p>
                    )}
                    {answersChecked && (
                      <p className="text-gray-500 mt-1">
                        Correct answer: {answerkey[index]}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-gray-700">{question}</p>
                )}
              </div>
            ))}
            <button 
              onClick={checkAnswers} 
              className="mt-6 bg-blue-500 text-white px-6 py-3 rounded-md shadow-md hover:bg-blue-600 transition duration-300"
            >
              Check Answers
            </button>
          </div>
        )}
      </div>
      <Footer/>
    </div>
  );
};

export default ReadingPage;